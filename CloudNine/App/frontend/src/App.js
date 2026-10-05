import React, { useState, useEffect, useCallback } from "react";
import "@/App.css";
import { Toaster, toast } from "sonner";

import { Sidebar } from "@/components/layout/Sidebar";
import { Navbar } from "@/components/layout/Navbar";
import { apiService } from "@/services/api";

import { OverviewView } from "@/views/OverviewView";
import { PolicyModeView } from "@/views/PolicyModeView";
import { AirfareIndexView } from "@/views/AirfareIndexView";
import { RouteIntelligenceView } from "@/views/RouteIntelligenceView";
import { LeadTimeView } from "@/views/LeadTimeView";
import { AirlinesView } from "@/views/AirlinesView";
import { FareComponentsView } from "@/views/FareComponentsView";
import { CpiSensitivityView } from "@/views/CpiSensitivityView";
import { DataQualityView } from "@/views/DataQualityView";
import { ValidationView } from "@/views/ValidationView";
import { DataPipelineView } from "@/views/DataPipelineView";
import { RawDataView } from "@/views/RawDataView";
import { AlertsView } from "@/views/AlertsView";
import { MethodologyView } from "@/views/MethodologyView";
import { ApiExplorerView } from "@/views/ApiExplorerView";

function App() {
  const [dashboardMode, setDashboardMode] = useState("policy"); // policy | analyst
  const [activeTab, setActiveTab] = useState("overview");
  const [isScraping, setIsScraping] = useState(false);

  const [overviewData, setOverviewData] = useState(null);
  const [indexSeries, setIndexSeries] = useState([]);
  const [routes, setRoutes] = useState([]);
  const [leadTime, setLeadTime] = useState(null);
  const [airlines, setAirlines] = useState([]);
  const [fareComponents, setFareComponents] = useState(null);
  const [dataQuality, setDataQuality] = useState(null);
  const [validation, setValidation] = useState(null);
  const [cpi, setCpi] = useState(null);
  const [alerts, setAlerts] = useState([]);

  const [aiLoading, setAiLoading] = useState(false);
  const [aiResponse, setAiResponse] = useState(null);
  const [selectedRoute, setSelectedRoute] = useState("DEL-BOM");

  const loadAll = useCallback(async () => {
    try {
      const [
        ov,
        series,
        rts,
        lt,
        al,
        fc,
        dq,
        vd,
        cp,
        alr,
      ] = await Promise.all([
        apiService.getOverview(),
        apiService.getIndexSeries("30D", "daily"),
        apiService.getRoutes(),
        apiService.getLeadTime(),
        apiService.getAirlines(),
        apiService.getFareComponents(),
        apiService.getDataQuality(),
        apiService.getValidation(),
        apiService.getCpiSensitivity(),
        apiService.getAlerts(),
      ]);
      setOverviewData(ov);
      setIndexSeries(series?.series || series || []);
      setRoutes(rts?.routes || []);
      setLeadTime(lt);
      setAirlines(al?.airlines || al || []);
      setFareComponents(fc);
      setDataQuality(dq);
      setValidation(vd);
      setCpi(cp);
      setAlerts(alr?.alerts || alr || []);
    } catch (err) {
      console.error("Failed to load initial data", err);
      toast.error("Backend unreachable — using cached deterministic values.");
    }
  }, []);

  useEffect(() => {
    loadAll();
  }, [loadAll]);

  const handleAiExplain = useCallback(async (opts = {}) => {
    setAiLoading(true);
    try {
      const res = await apiService.explainMarketMovement({
        query_type: "market_overview",
        provider: opts.provider || "openai",
        deterministic_only: !!opts.deterministic_only,
      });
      setAiResponse(res);
      toast.success(`Intelligence refreshed (${res.mode})`);
    } catch (e) {
      toast.error("AI engine unavailable, showing deterministic values.");
    } finally {
      setAiLoading(false);
    }
  }, []);

  const handleTriggerScrape = useCallback(async () => {
    setIsScraping(true);
    try {
      const res = await apiService.startLiveScrape();
      toast.info("Live Airfare Scraper initiated! View live logs in Data Pipeline tab.");

      // Poll until process completes
      const pollInterval = setInterval(async () => {
        try {
          const status = await apiService.getScraperStatus();
          if (!status.is_running) {
            clearInterval(pollInterval);
            setIsScraping(false);
            if (status.status === "completed") {
              toast.success(`Live scraping complete (${status.duration_sec}s). Data updated!`);
            } else if (status.status === "failed") {
              toast.error("Scraper process exited with an error. Check terminal logs.");
            }
            await loadAll();
          }
        } catch (pollErr) {
          clearInterval(pollInterval);
          setIsScraping(false);
        }
      }, 1500);

    } catch (e) {
      toast.error("Failed to start live scraper agent.");
      setIsScraping(false);
    }
  }, [loadAll]);


  const handleSimulateCpi = useCallback(async (multiplier, fuelShock) => {
    try {
      const res = await apiService.simulateCpi(multiplier, fuelShock);
      // Do NOT overwrite the baseline `cpi` global state — return locally so
      // simulations are scoped to the view that requested them (see report iter1).
      return res;
    } catch (e) {
      toast.error("CPI simulation failed.");
      return null;
    }
  }, []);

  const handleSelectRoute = useCallback((routeLabel) => {
    setSelectedRoute(routeLabel);
    setActiveTab("route-intelligence");
  }, []);

  // Route content
  const renderView = () => {
    // In Policy mode, "overview" tab is replaced by the Policy briefing
    if (dashboardMode === "policy" && activeTab === "overview") {
      return (
        <PolicyModeView
          overviewData={overviewData}
          cpiData={cpi}
          onSimulateCpi={handleSimulateCpi}
          onSelectRoute={handleSelectRoute}
        />
      );
    }

    switch (activeTab) {
      case "overview":
        return (
          <OverviewView
            overviewData={overviewData}
            indexSeries={indexSeries}
            onSelectRoute={handleSelectRoute}
            onAiExplain={handleAiExplain}
            aiLoading={aiLoading}
            aiResponse={aiResponse}
          />
        );
      case "airfare-index":
        return <AirfareIndexView indexSeries={indexSeries} overviewData={overviewData} />;
      case "route-intelligence":
        return (
          <RouteIntelligenceView
            routes={routes}
            selectedRouteName={selectedRoute}
            onSelectRoute={setSelectedRoute}
          />
        );
      case "lead-time":
        return <LeadTimeView leadTimeData={leadTime} />;
      case "airlines":
        return <AirlinesView airlines={airlines} />;
      case "fare-components":
        return <FareComponentsView fareComponents={fareComponents} />;
      case "cpi-sensitivity":
        return <CpiSensitivityView cpiData={cpi} onSimulateCpi={handleSimulateCpi} />;
      case "data-quality":
        return <DataQualityView qualityData={dataQuality} />;
      case "validation":
        return <ValidationView validationData={validation} />;
      case "pipeline":
        return (
          <DataPipelineView
            onTriggerScrape={handleTriggerScrape}
            isScraping={isScraping}
          />
        );
      case "raw-data":
        return <RawDataView />;
      case "alerts":
        return <AlertsView alerts={alerts} onSelectRoute={handleSelectRoute} />;
      case "methodology":
        return <MethodologyView />;
      case "api":
        return <ApiExplorerView />;
      default:
        return (
          <OverviewView
            overviewData={overviewData}
            indexSeries={indexSeries}
            onSelectRoute={handleSelectRoute}
            onAiExplain={handleAiExplain}
            aiLoading={aiLoading}
            aiResponse={aiResponse}
          />
        );
    }
  };

  return (
    <div className="min-h-screen bg-[#08111F] text-[#F5F7FA] font-sans flex flex-col">
      <Toaster
        theme="dark"
        position="bottom-right"
        toastOptions={{
          style: {
            background: "#101D2D",
            border: "1px solid #1E3145",
            color: "#F5F7FA",
            fontFamily: "IBM Plex Mono, monospace",
            fontSize: "12px",
          },
        }}
      />
      <Navbar
        dashboardMode={dashboardMode}
        setDashboardMode={setDashboardMode}
        onTriggerScrape={handleTriggerScrape}
        isScraping={isScraping}
        activeTab={activeTab}
        setActiveTab={setActiveTab}
      />
      <div className="flex flex-1 min-h-0">
        <Sidebar
          activeTab={activeTab}
          setActiveTab={setActiveTab}
          dashboardMode={dashboardMode}
        />
        <main className="flex-1 overflow-y-auto px-4 lg:px-8 py-6 bg-[#08111F]">
          {renderView()}
          <footer className="mt-10 pt-4 border-t border-[#1E3145] flex flex-col md:flex-row justify-between items-center text-[10px] text-[#8FA3B8] font-mono gap-1">
            <span>© 2026 AIRX Intelligence Grid · SIH26056 · v1.0.0</span>
            <span>APIx = Σ (wᵢ · Iᵢ,t) · Base 2024=100 · NSO/RBI Compliant</span>
          </footer>
        </main>
      </div>
    </div>
  );
}

export default App;
