"""
Emergent-managed Google Auth integration for AIRX.

Flow (per Emergent Auth playbook):
  1. Frontend redirects to https://auth.emergentagent.com/?redirect=<frontend_origin>/dashboard
  2. User completes Google OAuth on Emergent hosted UI
  3. Emergent redirects back to <frontend>/#session_id=<session_id>
  4. Frontend forwards session_id to POST /api/auth/session
  5. Backend calls Emergent's /auth/v1/env/oauth/session-data with X-Session-ID header
  6. Backend stores the returned session_token in Mongo, sets httpOnly cookie,
     and returns the user profile.

Notes:
  - user_id is a custom UUID; we never expose Mongo's _id.
  - Sessions expire after 7 days (timezone-aware UTC).
"""
import os
import uuid
from datetime import datetime, timedelta, timezone
from typing import Optional

import httpx
from fastapi import APIRouter, Cookie, Header, HTTPException, Request, Response
from motor.motor_asyncio import AsyncIOMotorDatabase
from pydantic import BaseModel

EMERGENT_SESSION_URL = "https://demobackend.emergentagent.com/auth/v1/env/oauth/session-data"
SESSION_TTL_DAYS = 7
COOKIE_NAME = "session_token"


class SessionExchangeRequest(BaseModel):
    session_id: str


class UserOut(BaseModel):
    user_id: str
    email: str
    name: str
    picture: Optional[str] = None


def _cookie_kwargs(max_age: Optional[int] = SESSION_TTL_DAYS * 24 * 3600):
    return dict(
        key=COOKIE_NAME,
        max_age=max_age,
        path="/",
        httponly=True,
        secure=True,
        samesite="none",
    )


async def _find_active_session(db: AsyncIOMotorDatabase, token: str):
    doc = await db.user_sessions.find_one({"session_token": token}, {"_id": 0})
    if not doc:
        return None
    expires_at = doc.get("expires_at")
    if isinstance(expires_at, str):
        expires_at = datetime.fromisoformat(expires_at)
    if expires_at.tzinfo is None:
        expires_at = expires_at.replace(tzinfo=timezone.utc)
    if expires_at < datetime.now(timezone.utc):
        return None
    return doc


async def get_current_user_optional(
    db: AsyncIOMotorDatabase,
    session_token: Optional[str] = None,
    authorization: Optional[str] = None,
) -> Optional[dict]:
    """Returns the user document (without _id) or None if unauthenticated."""
    token = session_token
    if not token and authorization and authorization.lower().startswith("bearer "):
        token = authorization.split(" ", 1)[1].strip()
    if not token:
        return None
    session = await _find_active_session(db, token)
    if not session:
        return None
    user = await db.users.find_one({"user_id": session["user_id"]}, {"_id": 0})
    return user


def build_auth_router(db: AsyncIOMotorDatabase) -> APIRouter:
    router = APIRouter(prefix="/api/auth", tags=["auth"])

    @router.post("/session", response_model=UserOut)
    async def exchange_session(
        payload: SessionExchangeRequest,
        response: Response,
    ):
        """Exchange one-shot session_id (URL fragment) for a persistent session cookie."""
        if not payload.session_id:
            raise HTTPException(status_code=400, detail="session_id is required")

        try:
            async with httpx.AsyncClient(timeout=15.0) as client:
                r = await client.get(
                    EMERGENT_SESSION_URL,
                    headers={"X-Session-ID": payload.session_id},
                )
        except httpx.HTTPError as e:
            raise HTTPException(status_code=502, detail=f"Auth provider unreachable: {e}")

        if r.status_code != 200:
            raise HTTPException(status_code=401, detail="Invalid or expired session_id")

        data = r.json()
        email = data.get("email")
        name = data.get("name") or (email.split("@")[0] if email else "User")
        picture = data.get("picture")
        session_token = data.get("session_token")
        if not email or not session_token:
            raise HTTPException(status_code=502, detail="Malformed auth provider response")

        # Upsert user by email; keep the same custom user_id for repeat logins.
        existing = await db.users.find_one({"email": email}, {"_id": 0})
        if existing:
            user_id = existing["user_id"]
            await db.users.update_one(
                {"user_id": user_id},
                {"$set": {"name": name, "picture": picture, "last_login_at": datetime.now(timezone.utc)}},
            )
        else:
            user_id = f"user_{uuid.uuid4().hex[:12]}"
            await db.users.insert_one({
                "user_id": user_id,
                "email": email,
                "name": name,
                "picture": picture,
                "created_at": datetime.now(timezone.utc),
                "last_login_at": datetime.now(timezone.utc),
            })

        expires_at = datetime.now(timezone.utc) + timedelta(days=SESSION_TTL_DAYS)
        await db.user_sessions.insert_one({
            "user_id": user_id,
            "session_token": session_token,
            "expires_at": expires_at,
            "created_at": datetime.now(timezone.utc),
        })

        response.set_cookie(value=session_token, **_cookie_kwargs())

        return UserOut(user_id=user_id, email=email, name=name, picture=picture)

    @router.get("/me", response_model=UserOut)
    async def me(
        session_token: Optional[str] = Cookie(default=None),
        authorization: Optional[str] = Header(default=None),
    ):
        user = await get_current_user_optional(db, session_token, authorization)
        if not user:
            raise HTTPException(status_code=401, detail="Not authenticated")
        return UserOut(
            user_id=user["user_id"],
            email=user["email"],
            name=user["name"],
            picture=user.get("picture"),
        )

    @router.post("/logout")
    async def logout(
        response: Response,
        session_token: Optional[str] = Cookie(default=None),
        authorization: Optional[str] = Header(default=None),
    ):
        token = session_token
        if not token and authorization and authorization.lower().startswith("bearer "):
            token = authorization.split(" ", 1)[1].strip()
        if token:
            await db.user_sessions.delete_many({"session_token": token})
        response.delete_cookie(key=COOKIE_NAME, path="/", samesite="none", secure=True)
        return {"status": "logged_out"}

    return router
