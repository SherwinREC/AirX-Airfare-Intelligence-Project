"""
End-to-end integration test for agent pipeline
"""

import asyncio
from pathlib import Path
from agent.orchestrator import AirfareAgentOrchestrator
from models.airfare import ScrapeStatusEnum


def test_pipeline_execution(tmp_path):
    orchestrator = AirfareAgentOrchestrator(base_dir=str(tmp_path))
    summary = asyncio.run(orchestrator.execute_run())

    assert summary.status in [ScrapeStatusEnum.SUCCESS, ScrapeStatusEnum.PARTIAL_SUCCESS]
    assert summary.records_scraped > 0
    assert summary.records_valid > 0

    # Verify master CSV export
    csv_file = tmp_path / "data" / "airfare_master.csv"
    assert csv_file.exists()
    assert csv_file.stat().st_size > 0
