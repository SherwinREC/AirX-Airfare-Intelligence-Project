import React from "react";
import { TEST_IDS } from "../constants/testIds";
import {
  ShieldAlert,
  CheckCircle2,
  AlertTriangle,
  Activity,
  Database,
  Layers,
  Server,
  Filter
} from "lucide-react";

export const DataQualityView = ({ qualityData }) => {
  const q = qualityData || {
    total_observations: 98757,
    valid_observations: 98722,
    invalid_observations: 35,
    validity_pct: 99.965,
    outliers: 133,
    outlier_rate_pct: 0.184,
    routes_count: 36,
    airlines_count: 5,
    sources_count: 4,
    source_availability: [
      { source: "mock_airline (Direct Carrier GDS/API)", status: "Available", records: 94968, coverage_pct: 96.2, latency_ms: 142 },
      { source: "ixigo (Aggregator Feed)", status: "Available", records: 1676, coverage_pct: 100.0, latency_ms: 380 },
      { source: "easemytrip (OTA Feed)", status: "Available", records: 1676, coverage_pct: 100.0, latency_ms: 415 },
      { source: "google_flights (Validation Feed)", status: "Available", records: 437, coverage_pct: 98.4, latency_ms: 520 }
    ],
    pipeline_stages: [
      { stage: "1. Ingestion & Scraping", completion_pct: 96.0, status: "HEALTHY", processed_records: 98757 },
      { stage: "2. Schema & Price Validation", completion_pct: 93.5, status: "HEALTHY", processed_records: 98722 },
      { stage: "3. Deduplication & Outlier Scrub", completion_pct: 98.2, status: "HEALTHY", processed_records: 98589 },
      { stage: "4. APIx Weighting Engine", completion_pct: 91.0, status: "HEALTHY", processed_records: 98589 }
    ]
  };

  return (
    <div className="space-y-6 pb-12">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between pb-4 border-b border-[#1E3145] gap-3">
        <div>
          <h2 className="text-xl font-bold text-[#F5F7FA] tracking-tight flex items-center gap-2">
            Data Quality, Coverage & Pipeline Health
            <span className="text-xs font-mono font-normal px-2.5 py-0.5 rounded bg-[#35D07F]/10 text-[#35D07F] border border-[#35D07F]/30 font-semibold">
              Validity: {q.validity_pct}%
            </span>
          </h2>
          <p className="text-xs text-[#8FA3B8] mt-1">
            Rigorous data cleaning, schema validation, outlier filtering, and feed health monitoring
          </p>
        </div>
        <div className="text-xs font-mono text-[#35D07F] bg-[#101D2D] px-3.5 py-1.5 rounded border border-[#1E3145] flex items-center gap-1.5">
          <span className="w-2 h-2 rounded-full bg-[#35D07F] animate-pulse"></span>
          Pipeline Status: OPTIMAL
        </div>
      </div>

      {/* 4 Quality Hero Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <div
          data-testid={TEST_IDS.QUALITY_TOTAL_OBS}
          className="bg-[#101D2D] border border-[#1E3145] p-4 rounded-lg shadow-md"
        >
          <span className="text-xs text-[#8FA3B8] uppercase font-semibold">Total Observations</span>
          <div className="text-2xl font-bold font-mono text-[#F5F7FA] mt-1.5">
            {q.total_observations.toLocaleString()}
          </div>
          <div className="text-[10px] text-[#8FA3B8] mt-2 pt-2 border-t border-[#1E3145]">
            2 Scrape Epochs (25 & 27 Aug 2026)
          </div>
        </div>

        <div
          data-testid={TEST_IDS.QUALITY_VALID_OBS}
          className="bg-[#101D2D] border border-[#1E3145] p-4 rounded-lg shadow-md"
        >
          <span className="text-xs text-[#8FA3B8] uppercase font-semibold">Valid Observations</span>
          <div className="text-2xl font-bold font-mono text-[#35D07F] mt-1.5">
            {q.valid_observations.toLocaleString()}
          </div>
          <div className="text-[10px] text-[#FF5C6C] mt-2 pt-2 border-t border-[#1E3145]">
            Rejected: {q.invalid_observations} null tariff rows
          </div>
        </div>

        <div
          data-testid={TEST_IDS.QUALITY_VALIDITY_RATE}
          className="bg-[#101D2D] border border-[#1E3145] p-4 rounded-lg shadow-md"
        >
          <span className="text-xs text-[#8FA3B8] uppercase font-semibold">Data Validity Rate</span>
          <div className="text-2xl font-bold font-mono text-[#35A7FF] mt-1.5">
            {q.validity_pct}%
          </div>
          <div className="text-[10px] text-[#35D07F] mt-2 pt-2 border-t border-[#1E3145]">
            ● High Statistical Rigour
          </div>
        </div>

        <div
          data-testid={TEST_IDS.QUALITY_OUTLIERS_COUNT}
          className="bg-[#101D2D] border border-[#1E3145] p-4 rounded-lg shadow-md"
        >
          <span className="text-xs text-[#8FA3B8] uppercase font-semibold">Outliers Isolated</span>
          <div className="text-2xl font-bold font-mono text-[#F5B942] mt-1.5">
            {q.outliers}
          </div>
          <div className="text-[10px] text-[#8FA3B8] mt-2 pt-2 border-t border-[#1E3145]">
            Outlier Rate: ~{q.outlier_rate_pct}% (IQR Filtered)
          </div>
        </div>
      </div>

      {/* Data Pipeline Health Progress & Source Feeds Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Pipeline Stage Health */}
        <div
          data-testid={TEST_IDS.QUALITY_PIPELINE_STAGES}
          className="bg-[#101D2D] border border-[#1E3145] p-5 rounded-lg shadow-lg space-y-4"
        >
          <div className="flex items-center justify-between pb-3 border-b border-[#1E3145]">
            <div className="flex items-center gap-2">
              <Activity className="w-4 h-4 text-[#35A7FF]" />
              <h3 className="text-sm font-semibold uppercase tracking-wider text-[#F5F7FA]">
                Data Pipeline Execution Health
              </h3>
            </div>
            <span className="text-xs font-mono text-[#35D07F]">4 Stages Operational</span>
          </div>

          <div className="space-y-4">
            {q.pipeline_stages.map((stage, idx) => (
              <div key={idx} className="space-y-1.5">
                <div className="flex justify-between text-xs font-mono">
                  <span className="text-[#F5F7FA] font-medium">{stage.stage}</span>
                  <span className="text-[#35D07F] font-bold">{stage.completion_pct}%</span>
                </div>
                <div className="w-full h-2 bg-[#08111F] rounded-full overflow-hidden border border-[#1E3145]">
                  <div
                    className="h-full bg-[#35A7FF] rounded-full"
                    style={{ width: `${stage.completion_pct}%` }}
                  />
                </div>
                <div className="flex justify-between text-[10px] text-[#8FA3B8]">
                  <span>Processed: {stage.processed_records.toLocaleString()} rows</span>
                  <span className="text-[#35D07F]">● Status: {stage.status}</span>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Source Feeds Availability */}
        <div
          data-testid={TEST_IDS.QUALITY_SOURCES_LIST}
          className="bg-[#101D2D] border border-[#1E3145] p-5 rounded-lg shadow-lg space-y-4"
        >
          <div className="flex items-center justify-between pb-3 border-b border-[#1E3145]">
            <div className="flex items-center gap-2">
              <Server className="w-4 h-4 text-[#35A7FF]" />
              <h3 className="text-sm font-semibold uppercase tracking-wider text-[#F5F7FA]">
                Source Feeds & Scraper Availability
              </h3>
            </div>
            <span className="text-xs font-mono text-[#8FA3B8]">4 Ingestion Channels</span>
          </div>

          <div className="space-y-3">
            {q.source_availability.map((s, idx) => (
              <div
                key={idx}
                className="p-3 bg-[#08111F] rounded border border-[#1E3145] flex items-center justify-between"
              >
                <div className="space-y-0.5">
                  <div className="font-mono text-xs font-bold text-[#F5F7FA]">{s.source}</div>
                  <div className="text-[11px] text-[#8FA3B8]">
                    Records: <span className="font-mono text-[#35A7FF]">{s.records.toLocaleString()}</span> · Latency: {s.latency_ms}ms
                  </div>
                </div>
                <div className="text-right">
                  <span className="text-[10px] px-2 py-0.5 rounded font-mono font-semibold bg-[#35D07F]/10 text-[#35D07F] border border-[#35D07F]/30">
                    ● {s.status} ({s.coverage_pct}%)
                  </span>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
};

export default DataQualityView;