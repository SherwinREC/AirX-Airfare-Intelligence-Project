import React, { useState } from "react";
import { TEST_IDS } from "../constants/testIds";
import { Terminal, Copy, PlayCircle, CheckCircle2, Code, FileJson } from "lucide-react";
import { apiService } from "../services/api";
import { toast } from "sonner";

const ENDPOINTS = [
  {
    id: "airfare-index",
    method: "GET",
    path: "/api/v1/airfare-index",
    title: "Current Airfare Price Index (APIx)",
    description: "Primary index publication endpoint for NSO / RBI ingestion. Returns latest published APIx value with base period metadata.",
    testId: TEST_IDS.API_ENDPOINT_AIRFARE_INDEX,
    sample: {
      date: "2026-08-27",
      index: 100.43,
      change: 0.43,
      base_period: "2026-08-25 = 100.00",
      sample_size: 98722,
      confidence: "HIGH",
    },
    call: async () => {
      const url = `${process.env.REACT_APP_BACKEND_URL}/api/v1/airfare-index`;
      const res = await fetch(url);
      return res.json();
    },
  },
  {
    id: "routes",
    method: "GET",
    path: "/api/v1/routes",
    title: "Monitored Route Basket",
    description: "Returns the full 36-route basket with weights, mean fare, index level & route-level statistical properties.",
    sample: {
      total_routes: 36,
      data: [{ route: "DEL-BOM", weight_pct: 6.4, avg_fare_inr: 7420, index: 127.4 }],
    },
    call: async () => apiService.getRoutes(),
  },
  {
    id: "fares",
    method: "GET",
    path: "/api/v1/fares",
    title: "Fare Structure Aggregate",
    description: "National average fare decomposition (base, taxes, UDF, convenience) across the observation basket.",
    sample: {
      national_average_fare_inr: 5642,
      national_median_fare_inr: 5021,
      components: { base: 82, taxes: 15, fees: 3 },
    },
    call: async () => apiService.getFareComponents(),
  },
  {
    id: "cpi-sensitivity",
    method: "GET",
    path: "/api/v1/cpi-sensitivity",
    title: "CPI Sensitivity & Transmission",
    description: "Reference-only CPI contribution derived from official 0.07722% airfare basket weight. Not the current NSO all-commodity CPI.",
    sample: {
      cpi_base: "2024=100",
      apix_current: 100.43,
      airfare_movement_pct: 0.43,
      airfare_cpi_weight_pct: 0.07722,
      cpi_contribution_pp: 0.00033,
      illustrative_cpi: 100.00033,
    },
    call: async () => apiService.getCpiSensitivity(),
  },
  {
    id: "data-quality",
    method: "GET",
    path: "/api/v1/data-quality",
    title: "Data Quality Attestation",
    description: "Observation validity, outlier rate, source coverage, and pipeline health for audit & governance.",
    sample: {
      total_observations: 98757,
      valid_observations: 98722,
      validity_rate_pct: 99.965,
      outliers_detected: 133,
    },
    call: async () => apiService.getDataQuality(),
  },
];

export const ApiExplorerView = () => {
  const [activeEndpoint, setActiveEndpoint] = useState(ENDPOINTS[0]);
  const [responseBody, setResponseBody] = useState(activeEndpoint.sample);
  const [isLive, setIsLive] = useState(false);
  const [loading, setLoading] = useState(false);

  const backendUrl = process.env.REACT_APP_BACKEND_URL || "https://airx.gov.in";
  const curl = `curl -X ${activeEndpoint.method} "${backendUrl}${activeEndpoint.path}" \\\n  -H "Accept: application/json" \\\n  -H "X-API-Key: <NSO_INGEST_KEY>"`;

  const handleSelect = (ep) => {
    setActiveEndpoint(ep);
    setResponseBody(ep.sample);
    setIsLive(false);
  };

  const handleCopy = async () => {
    try {
      await navigator.clipboard.writeText(curl);
      toast.success("cURL request copied");
    } catch (e) {
      toast.error("Clipboard unavailable");
    }
  };

  const handleTryLive = async () => {
    setLoading(true);
    try {
      const res = await activeEndpoint.call();
      setResponseBody(res);
      setIsLive(true);
      toast.success(`Live response received (200 OK)`);
    } catch (e) {
      toast.error("Live call failed. Showing spec sample.");
      setResponseBody(activeEndpoint.sample);
      setIsLive(false);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="space-y-6 pb-12">
      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-center justify-between pb-4 border-b border-[#1E3145] gap-3">
        <div>
          <h2 className="text-xl font-bold text-[#F5F7FA] tracking-tight flex items-center gap-2">
            <Terminal className="w-5 h-5 text-[#35A7FF]" />
            AIRX REST API Explorer
            <span className="text-xs font-mono font-normal px-2 py-0.5 rounded bg-[#35A7FF]/10 text-[#35A7FF] border border-[#35A7FF]/30">
              v1.0.0
            </span>
          </h2>
          <p className="text-xs text-[#8FA3B8] mt-1">
            Official machine-readable statistical distribution channel — designed for NSO, RBI, MoCA & DGCA consumption.
          </p>
        </div>
        <div className="flex items-center gap-3">
          <div className="px-3 py-1.5 bg-[#101D2D] border border-[#1E3145] rounded-md text-[11px] font-mono text-[#8FA3B8]">
            Rate limit: <span className="text-[#F5F7FA]">1,000 req/min</span>
          </div>
          <div className="px-3 py-1.5 bg-[#101D2D] border border-[#1E3145] rounded-md text-[11px] font-mono text-[#35D07F]">
            ● API STATUS: NOMINAL
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-5">
        {/* Endpoints list */}
        <div className="bg-[#101D2D] border border-[#1E3145] rounded-lg p-4 lg:col-span-1">
          <div className="text-[11px] font-bold uppercase tracking-wider text-[#8FA3B8] mb-3">
            Available Endpoints
          </div>
          <div className="space-y-1.5">
            {ENDPOINTS.map((ep) => {
              const isActive = ep.id === activeEndpoint.id;
              return (
                <button
                  key={ep.id}
                  data-testid={ep.testId || `api-endpoint-${ep.id}`}
                  onClick={() => handleSelect(ep)}
                  className={`w-full text-left p-2.5 rounded-md border transition-colors ${
                    isActive
                      ? "border-[#35A7FF] bg-[#35A7FF]/10"
                      : "border-[#1E3145] hover:border-[#35A7FF]/40 hover:bg-[#08111F]"
                  }`}
                >
                  <div className="flex items-center gap-2">
                    <span className="text-[10px] font-mono font-bold px-1.5 py-0.5 rounded bg-[#35D07F]/15 text-[#35D07F]">
                      {ep.method}
                    </span>
                    <span className="font-mono text-xs text-[#F5F7FA] truncate">{ep.path}</span>
                  </div>
                  <p className="text-[11px] text-[#8FA3B8] mt-1 truncate">{ep.title}</p>
                </button>
              );
            })}
          </div>
        </div>

        {/* Endpoint detail */}
        <div className="lg:col-span-2 space-y-4">
          <div className="bg-[#101D2D] border border-[#1E3145] rounded-lg p-5">
            <div className="flex items-start justify-between pb-3 border-b border-[#1E3145]">
              <div>
                <div className="flex items-center gap-2">
                  <span className="text-[10px] font-mono font-bold px-2 py-0.5 rounded bg-[#35D07F]/15 text-[#35D07F]">
                    {activeEndpoint.method}
                  </span>
                  <code className="font-mono text-sm text-[#F5F7FA]">{activeEndpoint.path}</code>
                </div>
                <h3 className="text-sm font-semibold text-[#F5F7FA] mt-2">{activeEndpoint.title}</h3>
                <p className="text-xs text-[#8FA3B8] mt-1 leading-relaxed">{activeEndpoint.description}</p>
              </div>
            </div>

            {/* cURL block */}
            <div className="mt-4 space-y-1.5">
              <div className="flex items-center justify-between">
                <span className="text-[11px] font-mono uppercase text-[#8FA3B8]">Request (cURL)</span>
                <button
                  data-testid={TEST_IDS.API_COPY_CURL_BTN}
                  onClick={handleCopy}
                  className="text-[11px] font-mono text-[#35A7FF] hover:underline flex items-center gap-1"
                >
                  <Copy className="w-3 h-3" /> Copy
                </button>
              </div>
              <pre className="bg-[#08111F] border border-[#1E3145] rounded p-3 overflow-x-auto text-[11px] font-mono text-[#F5F7FA] leading-relaxed whitespace-pre">
{curl}
              </pre>
            </div>

            {/* Try live */}
            <div className="mt-4 flex items-center gap-2">
              <button
                data-testid={TEST_IDS.API_TRY_IT_OUT_BTN}
                onClick={handleTryLive}
                disabled={loading}
                className="flex items-center gap-1.5 bg-[#35A7FF] hover:bg-[#208fe6] text-[#08111F] font-bold text-xs px-3 py-1.5 rounded font-mono disabled:opacity-50"
              >
                <PlayCircle className="w-3.5 h-3.5" />
                {loading ? "Calling..." : "Try Live"}
              </button>
              {isLive && (
                <span className="text-[11px] font-mono text-[#35D07F] flex items-center gap-1">
                  <CheckCircle2 className="w-3.5 h-3.5" /> Live 200 OK
                </span>
              )}
              {!isLive && (
                <span className="text-[11px] font-mono text-[#8FA3B8]">Showing spec sample</span>
              )}
            </div>
          </div>

          {/* Response */}
          <div className="bg-[#101D2D] border border-[#1E3145] rounded-lg p-5">
            <div className="flex items-center justify-between pb-2 border-b border-[#1E3145] mb-3">
              <div className="flex items-center gap-2">
                <FileJson className="w-4 h-4 text-[#35A7FF]" />
                <span className="text-xs font-semibold uppercase tracking-wider text-[#F5F7FA]">Response Preview</span>
              </div>
              <span className="text-[10px] font-mono text-[#8FA3B8]">application/json</span>
            </div>
            <pre
              data-testid={TEST_IDS.API_RESPONSE_PREVIEW}
              className="bg-[#08111F] border border-[#1E3145] rounded p-3 overflow-x-auto max-h-96 text-[11px] font-mono text-[#F5F7FA] leading-relaxed"
            >
{JSON.stringify(responseBody, null, 2)}
            </pre>
          </div>
        </div>
      </div>

      {/* Governance strip */}
      <div className="bg-[#101D2D] border border-[#1E3145] rounded-lg p-4 text-xs text-[#8FA3B8] flex flex-col md:flex-row justify-between gap-2">
        <div className="flex items-center gap-2">
          <Code className="w-4 h-4 text-[#35A7FF]" />
          <span>Base URL: <code className="font-mono text-[#F5F7FA]">{backendUrl}</code></span>
        </div>
        <div className="flex items-center gap-4 font-mono">
          <span>Auth: <span className="text-[#F5F7FA]">X-API-Key</span></span>
          <span>Format: <span className="text-[#F5F7FA]">JSON</span></span>
          <span>SLA: <span className="text-[#35D07F]">99.9%</span></span>
        </div>
      </div>
    </div>
  );
};

export default ApiExplorerView;
