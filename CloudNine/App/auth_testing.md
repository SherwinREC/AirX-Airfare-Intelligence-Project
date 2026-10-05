# AIRX Auth Testing Playbook (Emergent Google Auth)

This file is copied verbatim from the Emergent integration playbook and is
intended for the automated testing agent. Read it before testing any auth-gated
flow in the AIRX dashboard.

## 1. Create Test User & Session (mongosh)

```bash
mongosh --eval "
use('test_database');
var userId = 'test-user-' + Date.now();
var sessionToken = 'test_session_' + Date.now();
db.users.insertOne({
  user_id: userId,
  email: 'test.user.' + Date.now() + '@example.com',
  name: 'Test User',
  picture: 'https://via.placeholder.com/150',
  created_at: new Date()
});
db.user_sessions.insertOne({
  user_id: userId,
  session_token: sessionToken,
  expires_at: new Date(Date.now() + 7*24*60*60*1000),
  created_at: new Date()
});
print('Session token: ' + sessionToken);
print('User ID: ' + userId);
"
```

## 2. Test Backend API

```bash
BASE_URL="https://airfare-cpi-tracker.preview.emergentagent.com"

# /auth/me via Bearer header (server-side validation)
curl -X GET "$BASE_URL/api/auth/me" \
  -H "Authorization: Bearer <SESSION_TOKEN>"

# /auth/me via cookie
curl -X GET "$BASE_URL/api/auth/me" \
  --cookie "session_token=<SESSION_TOKEN>"

# Logout
curl -X POST "$BASE_URL/api/auth/logout" \
  --cookie "session_token=<SESSION_TOKEN>"
```

Expected: 200 with `{ user_id, email, name, picture }` when the session token
is present and unexpired; 401 otherwise.

## 3. Browser (Playwright) Testing

```python
await page.context.add_cookies([{
    "name": "session_token",
    "value": "<SESSION_TOKEN>",
    "domain": "airfare-cpi-tracker.preview.emergentagent.com",
    "path": "/",
    "httpOnly": True,
    "secure": True,
    "sameSite": "None"
}])
await page.goto("https://airfare-cpi-tracker.preview.emergentagent.com/")
# The AIRX dashboard should load directly (skipping the login gate).
```

## 4. Quick Debug

```bash
mongosh --eval "
use('test_database');
db.users.find().limit(2).pretty();
db.user_sessions.find().limit(2).pretty();
"

# Clean test data
mongosh --eval "
use('test_database');
db.users.deleteMany({email: /test\\.user\\./});
db.user_sessions.deleteMany({session_token: /test_session/});
"
```

## Checklist

- [ ] User document has `user_id` field (custom UUID). Never expose `_id`.
- [ ] `user_sessions.user_id` matches `users.user_id` exactly.
- [ ] All backend queries use `{"_id": 0}` projection.
- [ ] `/api/auth/me` returns 200 with a Bearer token OR cookie.
- [ ] `/api/auth/me` returns 401 for missing / invalid token.
- [ ] Login screen appears when unauthenticated; dashboard appears when
      authenticated.
- [ ] Clicking "Sign in with Google" redirects to
      `https://auth.emergentagent.com/?redirect=<current_origin>`.
- [ ] Return with `#session_id=...` in the URL fragment is processed once and
      the fragment is cleared before the dashboard renders.
- [ ] Logout deletes the Mongo session, clears the cookie, and returns the user
      to the login screen.

## AIRX-specific data-testids

- `login-google-btn` — Sign-in button on the auth gate.
- `auth-gate-container` — The login screen wrapper.
- `user-profile-menu` — Profile menu in the top navbar.
- `logout-btn` — Logout button inside the profile menu.
