import React from "react";
import { TEST_IDS } from "../../constants/testIds";
import { Plane, RefreshCw, ShieldCheck, Database, Code, Activity, Landmark, LineChart } from "lucide-react";

export const Navbar = ({
  dashboardMode,
  setDashboardMode,
  onTriggerScrape,
  isScraping,
  lastUpdated = "27 Aug 2026 16:40 IST",
  activeTab,
  setActiveTab
}) => {
  return (
    <header
      data-testid={TEST_IDS.NAVBAR}
      className="sticky top-0 z-50 w-full bg-[#08111F]/95 backdrop-blur-md border-b border-[#1E3145] px-4 lg:px-6 py-3"
    >
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-3">
        {/* Left: Brand & Product identity */}
        <div className="flex items-center gap-3">
          <div
            data-testid={TEST_IDS.BRAND_LOGO}
            className="flex items-center gap-2.5 cursor-pointer"
            onClick={() => setActiveTab("overview")}
          >
            <div className="w-9 h-9 rounded-lg bg-[#35A7FF]/10 border border-[#35A7FF]/30 flex items-center justify-center text-[#35A7FF]">
              <Plane className="w-5 h-5" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <span className="font-bold text-lg tracking-wider text-[#F5F7FA]">AIRX</span>
                <span className="text-[10px] font-semibold tracking-wider uppercase px-1.5 py-0.5 rounded bg-[#1E3145] text-[#8FA3B8] border border-[#1E3145]">
                  🇮🇳 NSO / RBI Edition
                </span>
              </div>
              <p className="text-xs text-[#8FA3B8]">
                Indian Airfare Price Index & CPI Transmission Engine
              </p>
            </div>
          </div>
        </div>

        {/* Center: Policy Mode vs Analyst Mode Switcher */}
        <div className="flex items-center bg-[#101D2D] p-1 rounded-lg border border-[#1E3145]">
          <button
            data-testid={TEST_IDS.MODE_TOGGLE_POLICY}
            onClick={() => setDashboardMode("policy")}
            className={`flex items-center gap-1.5 px-3 py-1.5 rounded text-xs font-semibold transition-all ${
              dashboardMode === "policy"
                ? "bg-[#35A7FF] text-[#08111F] shadow-sm font-bold"
                : "text-[#8FA3B8] hover:text-[#F5F7FA] hover:bg-[#16283D]"
            }`}
          >
            <Landmark className="w-3.5 h-3.5" />
            <span>Policy Intelligence</span>
            <span className="text-[9px] px-1 py-0.2 rounded bg-black/20 uppercase font-mono">
              Gov
            </span>
          </button>
          <button
            data-testid={TEST_IDS.MODE_TOGGLE_ANALYST}
            onClick={() => setDashboardMode("analyst")}
            className={`flex items-center gap-1.5 px-3 py-1.5 rounded text-xs font-semibold transition-all ${
              dashboardMode === "analyst"
                ? "bg-[#35A7FF] text-[#08111F] shadow-sm font-bold"
                : "text-[#8FA3B8] hover:text-[#F5F7FA] hover:bg-[#16283D]"
            }`}
          >
            <LineChart className="w-3.5 h-3.5" />
            <span>Analyst Mode</span>
            <span className="text-[9px] px-1 py-0.2 rounded bg-black/20 uppercase font-mono">
              Stats
            </span>
          </button>
        </div>

        {/* Right: Data Status & Live Pipeline Action */}
        <div className="flex items-center gap-3">
          <div
            data-testid={TEST_IDS.LIVE_PULSE_INDICATOR}
            className="flex items-center gap-2 bg-[#101D2D] border border-[#1E3145] px-3 py-1.5 rounded-md text-xs"
          >
            <span className="relative flex h-2 w-2">
              <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-[#35D07F] opacity-75"></span>
              <span className="relative inline-flex rounded-full h-2 w-2 bg-[#35D07F]"></span>
            </span>
            <div className="flex flex-col text-left">
              <span className="font-semibold text-[#F5F7FA] text-[11px] leading-tight">DAILY BATCH UPDATE</span>
              <span className="text-[10px] font-mono text-[#8FA3B8] leading-tight">{lastUpdated}</span>
            </div>
          </div>

          <button
            data-testid={TEST_IDS.TRIGGER_SCRAPE_BTN}
            onClick={() => {
              if (setActiveTab) setActiveTab("pipeline");
              if (onTriggerScrape) onTriggerScrape();
            }}
            disabled={isScraping}
            className="flex items-center gap-1.5 bg-[#35A7FF]/10 hover:bg-[#35A7FF]/20 border border-[#35A7FF]/40 text-[#35A7FF] hover:text-[#F5F7FA] px-3.5 py-1.5 rounded-md text-xs font-semibold font-mono transition-colors shadow-sm"
            title="Execute live scraper process (airfare_agent/main.py)"
          >
            <RefreshCw className={`w-3.5 h-3.5 ${isScraping ? "animate-spin" : ""}`} />
            <span className="hidden sm:inline">{isScraping ? "Scraping Active..." : "Start Live Scraping"}</span>
          </button>


          <button
            data-testid={TEST_IDS.VIEW_API_DOCS_NAV}
            onClick={() => setActiveTab("api")}
            className="flex items-center gap-1.5 bg-[#101D2D] hover:bg-[#1E3145] border border-[#1E3145] text-[#8FA3B8] hover:text-[#F5F7FA] px-2.5 py-1.5 rounded-md text-xs font-mono transition-colors"
          >
            <Code className="w-3.5 h-3.5 text-[#35A7FF]" />
            <span className="hidden md:inline">API</span>
          </button>
        </div>
      </div>
    </header>
  );
};

export default Navbar;