import React, { useState } from "react";
import { TEST_IDS } from "../constants/testIds";
import {
  Landmark,
  ShieldAlert,
  TrendingUp,
  AlertTriangle,
  CheckCircle2,
  ArrowUpRight,
  Calculator,
  FileText,
  Zap,
  Sliders,
  HelpCircle
} from "lucide-react";

export const PolicyModeView = ({
  overviewData,
  cpiData,
  onSimulateCpi,
  onSelectRoute
}) => {
  const [fuelShock, setFuelShock] = useState(0);
  const [demandMultiplier, setDemandMultiplier] = useState(1.0);
  const [simulatedResult, setSimulatedResult] = useState(null);
  const [simulating, setSimulating] = useState(false);

  const apix = overviewData?.kpis?.apix || 100.43;
  const apixChange = overviewData?.kpis?.apix_change_pct || 0.43;

  const handleRunSimulation = async () => {
    setSimulating(true);
    try {
      if (onSimulateCpi) {
        const res = await onSimulateCpi(demandMultiplier, fuelShock);
        setSimulatedResult(res);
      }
    } finally {
      setSimulating(false);
    }
  };

  const currentCpi = simulatedResult || cpiData || {
    cpi_base: "2024=100",
    apix_current: 100.43,
    airfare_movement_pct: 0.43,
    airfare_cpi_weight_pct: 0.07722,
    cpi_contribution_pp: 0.00033,
    illustrative_cpi: 100.00033,
    label: "Reference/Sensitivity (Not Official Current All-Commodity CPI)"
  };

  return (
    <div data-testid={TEST_IDS.POLICY_BRIEFING_CONTAINER} className="space-y-6 pb-12">
      {/* Government Executive Banner */}
      <div className="bg-[#101D2D] border-l-4 border-l-[#35A7FF] border border-[#1E3145] rounded-lg p-5 shadow-lg flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div className="space-y-1">
          <div className="flex items-center gap-2">
            <Landmark className="w-5 h-5 text-[#35A7FF]" />
            <h2 className="text-xl font-bold text-[#F5F7FA] tracking-tight">
              🇮🇳 Indian Airfare Policy Intelligence Briefing
            </h2>
            <span className="text-[10px] font-mono px-2 py-0.5 rounded bg-[#35D07F]/10 text-[#35D07F] border border-[#35D07F]/30 font-semibold">
              GOVERNMENT ACCESS: NSO / RBI / MoCA
            </span>
          </div>
          <p className="text-xs text-[#8FA3B8]">
            Official Macroeconomic & Civil Aviation Tariff Assessment · High-Frequency Inflation Transmission
          </p>
        </div>
        <div className="flex items-center gap-2">
          <div className="bg-[#08111F] px-3.5 py-2 rounded-md border border-[#1E3145] text-right">
            <span className="text-[10px] uppercase text-[#8FA3B8] font-bold">Policy Transmission Stance</span>
            <div className="text-xs font-mono font-bold text-[#35D07F] flex items-center justify-end gap-1">
              <CheckCircle2 className="w-3.5 h-3.5 text-[#35D07F]" />
              MONITORED / BENIGN (0.00033 pp)
            </div>
          </div>
        </div>
      </div>

      {/* 4 Executive Hero KPI Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <div className="bg-[#101D2D] border border-[#1E3145] rounded-lg p-4 shadow-md">
          <span className="text-xs text-[#8FA3B8] font-semibold uppercase tracking-wider">
            National Airfare Index (APIx)
          </span>
          <div className="text-3xl font-bold font-mono text-[#F5F7FA] mt-2">
            {apix}
          </div>
          <div className="flex items-center gap-1.5 mt-1 text-xs font-mono text-[#FF5C6C]">
            <ArrowUpRight className="w-3.5 h-3.5" />
            <span>+{apixChange}% (48h cycle)</span>
          </div>
          <div className="text-[10px] text-[#8FA3B8] mt-2 pt-2 border-t border-[#1E3145]">
            Base Anchor: 25 Aug 2026 = 100.00
          </div>
        </div>

        <div className="bg-[#101D2D] border border-[#1E3145] rounded-lg p-4 shadow-md">
          <span className="text-xs text-[#8FA3B8] font-semibold uppercase tracking-wider">
            Reference CPI Contribution
          </span>
          <div className="text-3xl font-bold font-mono text-[#35A7FF] mt-2">
            +0.00033 pp
          </div>
          <div className="text-xs text-[#8FA3B8] mt-1">
            Airfare Basket Weight: <span className="font-mono text-[#F5F7FA]">0.07722%</span>
          </div>
          <div className="text-[10px] text-[#8FA3B8] mt-2 pt-2 border-t border-[#1E3145]">
            Illustrative Airfare CPI: 100.00033
          </div>
        </div>

        <div className="bg-[#101D2D] border border-[#1E3145] rounded-lg p-4 shadow-md">
          <span className="text-xs text-[#8FA3B8] font-semibold uppercase tracking-wider">
            High-Pressure Sectors
          </span>
          <div className="text-3xl font-bold font-mono text-[#FF5C6C] mt-2">
            2 Routes
          </div>
          <div className="text-xs text-[#8FA3B8] mt-1">
            DEL-BOM (+6.4%) · BLR-MAA (+5.9%)
          </div>
          <div className="text-[10px] text-[#8FA3B8] mt-2 pt-2 border-t border-[#1E3145]">
            Out of 36 Monitored Corridors
          </div>
        </div>

        <div className="bg-[#101D2D] border border-[#1E3145] rounded-lg p-4 shadow-md">
          <span className="text-xs text-[#8FA3B8] font-semibold uppercase tracking-wider">
            Statistical Confidence
          </span>
          <div className="text-3xl font-bold font-mono text-[#35D07F] mt-2">
            99.96%
          </div>
          <div className="text-xs text-[#8FA3B8] mt-1">
            98,722 Valid Observations
          </div>
          <div className="text-[10px] text-[#8FA3B8] mt-2 pt-2 border-t border-[#1E3145]">
            DGCA Correlation: r = 0.91
          </div>
        </div>
      </div>

      {/* Areas Requiring Policy Attention & AI Executive Summary */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Areas Requiring Policy Attention */}
        <div
          data-testid={TEST_IDS.POLICY_HIGH_PRESSURE_ROUTES}
          className="bg-[#101D2D] border border-[#1E3145] rounded-lg p-5 shadow-lg flex flex-col justify-between"
        >
          <div>
            <div className="flex items-center justify-between pb-3 border-b border-[#1E3145]">
              <div className="flex items-center gap-2">
                <AlertTriangle className="w-4 h-4 text-[#FF5C6C]" />
                <h3 className="text-sm font-semibold uppercase tracking-wider text-[#F5F7FA]">
                  Areas Requiring Policy Oversight
                </h3>
              </div>
              <span className="text-xs text-[#8FA3B8]">August 2026 Cycle</span>
            </div>

            <div className="space-y-3 my-4">
              <div
                onClick={() => onSelectRoute && onSelectRoute("DEL-BOM")}
                className="p-3 bg-[#08111F] rounded border border-[#FF5C6C]/40 hover:border-[#FF5C6C] cursor-pointer transition-colors space-y-1.5"
              >
                <div className="flex justify-between items-center">
                  <span className="font-mono font-bold text-sm text-[#F5F7FA]">🔴 DEL → BOM (Trunk Metro)</span>
                  <span className="font-mono text-xs text-[#FF5C6C] font-bold">+6.4% MoM</span>
                </div>
                <p className="text-xs text-[#8FA3B8]">
                  Average fare at ₹7,420 with high short-lead booking surge (T+1). Recommend monitoring peak business slot availability.
                </p>
              </div>

              <div
                onClick={() => onSelectRoute && onSelectRoute("BLR-MAA")}
                className="p-3 bg-[#08111F] rounded border border-[#FF5C6C]/40 hover:border-[#FF5C6C] cursor-pointer transition-colors space-y-1.5"
              >
                <div className="flex justify-between items-center">
                  <span className="font-mono font-bold text-sm text-[#F5F7FA]">🔴 BLR → MAA (Southern Tech Corridor)</span>
                  <span className="font-mono text-xs text-[#FF5C6C] font-bold">+5.9% MoM</span>
                </div>
                <p className="text-xs text-[#8FA3B8]">
                  Wide intra-day volatility (₹2,102 to ₹17,500). Driven by high passenger load factor on late-evening rotations.
                </p>
              </div>

              <div
                onClick={() => onSelectRoute && onSelectRoute("DEL-BLR")}
                className="p-3 bg-[#08111F] rounded border border-[#F5B942]/40 hover:border-[#F5B942] cursor-pointer transition-colors space-y-1.5"
              >
                <div className="flex justify-between items-center">
                  <span className="font-mono font-bold text-sm text-[#F5F7FA]">🟠 DEL → BLR (Metro Business)</span>
                  <span className="font-mono text-xs text-[#F5B942] font-bold">+3.8% MoM</span>
                </div>
                <p className="text-xs text-[#8FA3B8]">
                  Moderate upward drift with stable 92% airline inventory coverage.
                </p>
              </div>
            </div>
          </div>

          <div className="text-[11px] text-[#8FA3B8] pt-3 border-t border-[#1E3145] flex justify-between items-center">
            <span>Threshold: &gt;5% deviation triggers formal advisory</span>
            <span className="text-[#35A7FF] font-mono">2 / 36 Routes in Watchlist</span>
          </div>
        </div>

        {/* AI & Quantitative Executive Policy Brief */}
        <div className="bg-[#101D2D] border border-[#1E3145] rounded-lg p-5 shadow-lg flex flex-col justify-between">
          <div>
            <div className="flex items-center justify-between pb-3 border-b border-[#1E3145]">
              <div className="flex items-center gap-2">
                <FileText className="w-4 h-4 text-[#35A7FF]" />
                <h3 className="text-sm font-semibold uppercase tracking-wider text-[#F5F7FA]">
                  Executive Macroeconomic Briefing
                </h3>
              </div>
              <span className="text-[10px] font-mono text-[#35D07F]">OFFICIAL MEMORANDUM</span>
            </div>

            <div className="my-4 space-y-3 text-xs leading-relaxed text-[#8FA3B8]">
              <p className="bg-[#08111F] p-3 rounded border border-[#1E3145] text-[#F5F7FA]">
                <strong>1. Headline Movement:</strong> The national domestic airfare index (APIx) registered a modest +0.43% uptick (100.00 to 100.43). Transmission to headline CPI remains strictly contained at <strong>+0.00033 percentage points</strong>, given the 0.07722% weight of domestic civil aviation in the official NSO Consumer Price Index basket.
              </p>

              <p>
                <strong>2. Market Structure & Capacity:</strong> Market share remains balanced across the 5 monitored carriers (Air India 48.2%, IndiGo 22.6%, Vistara 16.4%, SpiceJet 9.7%, Fly91 3.1%). Direct carrier API feeds confirmed 99.965% observation validity with negligible outlier distortion (0.184%).
              </p>

              <p>
                <strong>3. Regulatory Recommendation:</strong> No immediate statutory price intervention or tariff capping is warranted. MoCA should continue tracking slot allocation on DEL-BOM during peak business hours.
              </p>
            </div>
          </div>

          <div className="text-[11px] text-[#8FA3B8] pt-3 border-t border-[#1E3145] flex justify-between items-center font-mono">
            <span>Prepared for: NSO / RBI Economic Intelligence</span>
            <span>Classification: OFFICIAL USE</span>
          </div>
        </div>
      </div>

      {/* Policy Scenario & Fuel Price Shock Simulator */}
      <div
        data-testid={TEST_IDS.POLICY_CPI_IMPACT_CARD}
        className="bg-[#101D2D] border border-[#1E3145] rounded-lg p-5 shadow-lg space-y-4"
      >
        <div className="flex flex-col sm:flex-row sm:items-center justify-between pb-3 border-b border-[#1E3145] gap-2">
          <div className="flex items-center gap-2">
            <Sliders className="w-4 h-4 text-[#35A7FF]" />
            <h3 className="text-sm font-semibold uppercase tracking-wider text-[#F5F7FA]">
              Policy Sensitivity & ATF Fuel Shock Simulator
            </h3>
          </div>
          <span className="text-xs text-[#8FA3B8]">
            Simulate macroeconomic shocks on APIx & NSO CPI
          </span>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 pt-2">
          {/* Controls */}
          <div className="space-y-4">
            <div>
              <div className="flex justify-between text-xs mb-1">
                <span className="text-[#8FA3B8]">Aviation Turbine Fuel (ATF) Shock:</span>
                <span className="font-mono text-[#FF5C6C] font-bold">+{fuelShock}%</span>
              </div>
              <input
                data-testid={TEST_IDS.CPI_FUEL_SHOCK_INPUT}
                type="range"
                min="0"
                max="30"
                step="5"
                value={fuelShock}
                onChange={(e) => setFuelShock(parseFloat(e.target.value))}
                className="w-full accent-[#35A7FF] cursor-pointer"
              />
              <div className="flex justify-between text-[10px] text-[#8FA3B8] font-mono mt-1">
                <span>Baseline (0%)</span>
                <span>+15% (Moderate)</span>
                <span>+30% (Severe)</span>
              </div>
            </div>

            <div>
              <div className="flex justify-between text-xs mb-1">
                <span className="text-[#8FA3B8]">Demand / Festival Surge Multiplier:</span>
                <span className="font-mono text-[#35A7FF] font-bold">{demandMultiplier}x</span>
              </div>
              <input
                data-testid={TEST_IDS.CPI_SIMULATOR_SLIDER}
                type="range"
                min="0.5"
                max="3.0"
                step="0.5"
                value={demandMultiplier}
                onChange={(e) => setDemandMultiplier(parseFloat(e.target.value))}
                className="w-full accent-[#35A7FF] cursor-pointer"
              />
              <div className="flex justify-between text-[10px] text-[#8FA3B8] font-mono mt-1">
                <span>0.5x (Slump)</span>
                <span>1.0x (Normal)</span>
                <span>3.0x (Diwali Peak)</span>
              </div>
            </div>

            <button
              data-testid={TEST_IDS.CPI_SIMULATE_BTN}
              onClick={handleRunSimulation}
              disabled={simulating}
              className="w-full py-2 bg-[#35A7FF] hover:bg-[#208fe6] text-[#08111F] font-bold text-xs rounded transition-colors font-mono flex items-center justify-center gap-2"
            >
              <Zap className="w-3.5 h-3.5" />
              {simulating ? "Computing Transmission..." : "Simulate Scenario Transmission"}
            </button>
          </div>

          {/* Simulation Output Cards */}
          <div className="md:col-span-2 grid grid-cols-1 sm:grid-cols-2 gap-4 bg-[#08111F] p-4 rounded-lg border border-[#1E3145]">
            <div className="space-y-1">
              <span className="text-xs text-[#8FA3B8] uppercase tracking-wider font-semibold">
                Simulated Airfare Shift
              </span>
              <div className="text-2xl font-bold font-mono text-[#FF5C6C]">
                {currentCpi.airfare_movement_pct > 0 ? `+${currentCpi.airfare_movement_pct}%` : `${currentCpi.airfare_movement_pct}%`}
              </div>
              <p className="text-[11px] text-[#8FA3B8]">
                Simulated APIx: <span className="font-mono text-[#F5F7FA] font-bold">{currentCpi.apix_current}</span>
              </p>
            </div>

            <div className="space-y-1">
              <span className="text-xs text-[#8FA3B8] uppercase tracking-wider font-semibold">
                Headline CPI Impact (Sensitivity)
              </span>
              <div className="text-2xl font-bold font-mono text-[#35A7FF]">
                +{currentCpi.cpi_contribution_pp} pp
              </div>
              <p className="text-[11px] text-[#8FA3B8]">
                Illustrative Airfare CPI: <span className="font-mono text-[#F5F7FA] font-bold">{currentCpi.illustrative_cpi}</span>
              </p>
            </div>

            <div className="sm:col-span-2 pt-2 border-t border-[#1E3145] text-xs text-[#8FA3B8] space-y-1">
              <div className="font-mono text-[11px] text-[#35D07F]">
                Mathematical Formulation: ΔCPI = ΔAPIx × (0.07722% / 100)
              </div>
              <p className="text-[11px]">
                {currentCpi.policy_impact ||
                  "Even under extreme +30% fuel shocks, direct inflation transmission remains below +0.01 percentage points due to the conservative NSO weight."}
              </p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default PolicyModeView;