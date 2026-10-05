import React, { useState, useEffect, useRef } from "react";
import { TEST_IDS } from "../constants/testIds";
import {
  GitMerge,
  RefreshCw,
  Database,
  ShieldCheck,
  TrendingUp,
  Calculator,
  ArrowDown,
  Terminal,
  CheckCircle2,
  Play,
  Activity,
  AlertCircle,
  Clock
} from "lucide-react";
import { apiService } from "../services/api";

export const DataPipelineView = ({ onTriggerScrape, isScraping }) => {
  const [scraperStatus, setScraperStatus] = useState({
    is_running: false,
    status: "idle",
    duration_sec: 0,
    logs: [
      "[INITIAL] Web App linked directly to airfare_agent/data/airfare_master.csv",
      "[READY] Click 'Start Live Scraping' to execute airfare_agent scraping pipeline in real-time."
    ]
  });

  const terminalEndRef = useRef(null);

  // Auto-scroll terminal log to bottom
  const scrollToBottom = () => {
    terminalEndRef.current?.scrollIntoView({ behavior: "smooth" });
  };

  // Poll scraper status periodically
  useEffect(() => {
    let interval = null;

    const fetchStatus = async () => {
      try {
        const data = await apiService.getScraperStatus();
        if (data && data.logs) {
          setScraperStatus(data);
        }
      } catch (err) {
        console.error("Failed to fetch live scraper status:", err);
      }
    };

    fetchStatus();
    interval = setInterval(fetchStatus, 1500);

    return () => {
      if (interval) clearInterval(interval);
    };
  }, []);

  useEffect(() => {
    scrollToBottom();
  }, [scraperStatus.logs]);

  const handleRun = async () => {
    if (onTriggerScrape) {
      await onTriggerScrape();
    }
  };

  const getStatusBadge = () => {
    if (scraperStatus.is_running || isScraping) {
      return (
        <span className="flex items-center gap-1.5 text-xs font-mono font-bold px-2.5 py-1 rounded bg-[#35A7FF]/10 text-[#35A7FF] border border-[#35A7FF]/30">
          <RefreshCw className="w-3 h-3 animate-spin text-[#35A7FF]" />
          SCRAPING IN PROGRESS ({scraperStatus.duration_sec}s)
        </span>
      );
    }
    if (scraperStatus.status === "completed") {
      return (
        <span className="flex items-center gap-1.5 text-xs font-mono font-bold px-2.5 py-1 rounded bg-[#35D07F]/10 text-[#35D07F] border border-[#35D07F]/30">
          <CheckCircle2 className="w-3 h-3 text-[#35D07F]" />
          RUN COMPLETE ({scraperStatus.duration_sec}s)
        </span>
      );
    }
    if (scraperStatus.status === "failed") {
      return (
        <span className="flex items-center gap-1.5 text-xs font-mono font-bold px-2.5 py-1 rounded bg-[#FF5C6C]/10 text-[#FF5C6C] border border-[#FF5C6C]/30">
          <AlertCircle className="w-3 h-3 text-[#FF5C6C]" />
          RUN FAILED
        </span>
      );
    }
    return (
      <span className="flex items-center gap-1.5 text-xs font-mono font-bold px-2.5 py-1 rounded bg-[#8FA3B8]/10 text-[#8FA3B8] border border-[#8FA3B8]/30">
        <Clock className="w-3 h-3 text-[#8FA3B8]" />
        AGENT IDLE
      </span>
    );
  };

  return (
    <div data-testid={TEST_IDS.PIPELINE_DAG_CONTAINER} className="space-y-6 pb-12">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between pb-4 border-b border-[#1E3145] gap-3">
        <div>
          <h2 className="text-xl font-bold text-[#F5F7FA] tracking-tight flex items-center gap-2">
            Data Pipeline DAG & Live Scraping Terminal
            {getStatusBadge()}
          </h2>
          <p className="text-xs text-[#8FA3B8] mt-1">
            Web application reads directly from <code className="text-[#35A7FF] font-mono bg-[#101D2D] px-1 py-0.5 rounded">airfare_agent/data/airfare_master.csv</code>. Triggering live scraping executes <code className="text-[#35A7FF] font-mono bg-[#101D2D] px-1 py-0.5 rounded">python main.py</code> in real-time.
          </p>
        </div>
        <button
          data-testid={TEST_IDS.PIPELINE_RUN_TRIGGER_BTN}
          onClick={handleRun}
          disabled={scraperStatus.is_running || isScraping}
          className={`flex items-center gap-2 px-5 py-2.5 rounded-md text-xs font-bold font-mono transition-all shadow-md ${
            scraperStatus.is_running || isScraping
              ? "bg-[#1E3145] text-[#8FA3B8] cursor-not-allowed border border-[#1E3145]"
              : "bg-[#35A7FF] hover:bg-[#208fe6] text-[#08111F] border border-[#35A7FF]"
          }`}
        >
          <Play className={`w-4 h-4 ${scraperStatus.is_running || isScraping ? "animate-spin text-[#8FA3B8]" : "fill-current"}`} />
          <span>{scraperStatus.is_running || isScraping ? "Scraping Active..." : "Start Live Scraping"}</span>
        </button>
      </div>

      {/* Visual DAG Flow Chart */}
      <div className="bg-[#101D2D] border border-[#1E3145] p-6 rounded-lg shadow-lg flex flex-col items-center space-y-4">
        {/* Node 1: Collection */}
        <div className="w-full max-w-md bg-[#08111F] border border-[#35A7FF]/50 p-4 rounded-lg flex items-center justify-between shadow-md">
          <div className="flex items-center gap-3">
            <div className="w-8 h-8 rounded bg-[#35A7FF]/10 text-[#35A7FF] flex items-center justify-center font-mono font-bold text-xs">
              01
            </div>
            <div>
              <div className="font-mono font-bold text-xs text-[#F5F7FA]">STAGE 1: SCRAPING & INGESTION</div>
              <div className="text-[11px] text-[#8FA3B8]">airfare_agent main.py (EaseMyTrip, Ixigo, Google Flights, Carriers)</div>
            </div>
          </div>
          <div className="text-right font-mono text-xs">
            <span className="text-[#35A7FF] font-bold">LIVELY SCRAPED</span>
          </div>
        </div>

        <ArrowDown className="w-5 h-5 text-[#8FA3B8]/60 animate-bounce" />

        {/* Node 2: Master CSV */}
        <div className="w-full max-w-md bg-[#08111F] border border-[#1E3145] p-4 rounded-lg flex items-center justify-between shadow-md">
          <div className="flex items-center gap-3">
            <div className="w-8 h-8 rounded bg-[#35D07F]/10 text-[#35D07F] flex items-center justify-center font-mono font-bold text-xs">
              02
            </div>
            <div>
              <div className="font-mono font-bold text-xs text-[#F5F7FA]">STAGE 2: MASTER CSV EXPORT</div>
              <div className="text-[11px] text-[#8FA3B8]">airfare_agent/data/airfare_master.csv</div>
            </div>
          </div>
          <div className="text-right font-mono text-xs">
            <span className="text-[#35D07F] font-bold">AUTO PERSIST</span>
          </div>
        </div>

        <ArrowDown className="w-5 h-5 text-[#8FA3B8]/60 animate-bounce" />

        {/* Node 3: Backend Memory Sync */}
        <div className="w-full max-w-md bg-[#08111F] border border-[#1E3145] p-4 rounded-lg flex items-center justify-between shadow-md">
          <div className="flex items-center gap-3">
            <div className="w-8 h-8 rounded bg-[#F5B942]/10 text-[#F5B942] flex items-center justify-center font-mono font-bold text-xs">
              03
            </div>
            <div>
              <div className="font-mono font-bold text-xs text-[#F5F7FA]">STAGE 3: BACKEND ANALYTICS SYNC</div>
              <div className="text-[11px] text-[#8FA3B8]">analytics_engine.reload_data() in App/backend</div>
            </div>
          </div>
          <div className="text-right font-mono text-xs">
            <span className="text-[#F5B942] font-bold">REAL-TIME</span>
          </div>
        </div>

        <ArrowDown className="w-5 h-5 text-[#8FA3B8]/60 animate-bounce" />

        {/* Node 4: Index Engine */}
        <div className="w-full max-w-md bg-[#08111F] border border-[#35A7FF] p-4 rounded-lg flex items-center justify-between shadow-md">
          <div className="flex items-center gap-3">
            <div className="w-8 h-8 rounded bg-[#35A7FF]/20 text-[#35A7FF] flex items-center justify-center font-mono font-bold text-xs">
              04
            </div>
            <div>
              <div className="font-mono font-bold text-xs text-[#35A7FF]">STAGE 4: APIx & WEB DASHBOARD UI</div>
              <div className="text-[11px] text-[#8FA3B8]">Live indicators, routes, and CPI calculations</div>
            </div>
          </div>
          <div className="text-right font-mono text-xs">
            <span className="text-[#35D07F] font-bold text-sm">UP-TO-DATE</span>
          </div>
        </div>
      </div>

      {/* Live Terminal Output Window */}
      <div className="bg-[#0B1726] border border-[#1E3145] rounded-lg shadow-2xl overflow-hidden font-mono">
        <div className="px-4 py-3 bg-[#101D2D] border-b border-[#1E3145] flex items-center justify-between">
          <div className="flex items-center gap-2">
            <Terminal className="w-4 h-4 text-[#35A7FF]" />
            <h3 className="text-xs font-bold uppercase tracking-wider text-[#F5F7FA]">
              Scraper Agent Live Terminal Output (airfare_agent/main.py)
            </h3>
          </div>
          <div className="flex items-center gap-3">
            {scraperStatus.is_running ? (
              <span className="text-[11px] text-[#35A7FF] animate-pulse flex items-center gap-1.5">
                <span className="w-2 h-2 rounded-full bg-[#35A7FF] inline-block"></span>
                STDOUT STREAM ACTIVE
              </span>
            ) : (
              <span className="text-[11px] text-[#8FA3B8] flex items-center gap-1.5">
                <span className="w-2 h-2 rounded-full bg-[#8FA3B8] inline-block"></span>
                TERMINAL STANDBY
              </span>
            )}
          </div>
        </div>
        <div className="p-4 bg-[#050A14] text-[12px] text-[#35D07F] space-y-1 max-h-80 overflow-y-auto font-mono selection:bg-[#35A7FF] selection:text-black leading-relaxed">
          {scraperStatus.logs && scraperStatus.logs.length > 0 ? (
            scraperStatus.logs.map((logLine, idx) => (
              <div key={idx} className="flex gap-2">
                <span className="text-[#8FA3B8] select-none text-[10px] w-6 text-right shrink-0">
                  {idx + 1}
                </span>
                <span className={
                  logLine.includes("[ERROR]") || logLine.includes("[FAIL]")
                    ? "text-[#FF5C6C]"
                    : logLine.includes("[SUCCESS]") || logLine.includes("[OK]")
                    ? "text-[#35D07F]"
                    : logLine.includes("Launching") || logLine.includes("Target")
                    ? "text-[#35A7FF]"
                    : "text-[#D1D5DB]"
                }>
                  {logLine}
                </span>
              </div>
            ))
          ) : (
            <div className="text-[#8FA3B8] italic py-2">No terminal logs recorded yet. Click 'Start Live Scraping' above to execute.</div>
          )}
          <div ref={terminalEndRef} />
        </div>
      </div>
    </div>
  );
};

export default DataPipelineView;