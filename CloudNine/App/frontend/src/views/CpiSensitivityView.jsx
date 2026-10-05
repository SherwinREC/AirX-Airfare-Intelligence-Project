import React, { useState } from "react";
import { TEST_IDS } from "../constants/testIds";
import {
  Calculator,
  Landmark,
  ShieldCheck,
  Zap,
  HelpCircle,
  Sliders,
  TrendingUp,
  FileSpreadsheet
} from "lucide-react";

export const CpiSensitivityView = ({ cpiData, onSimulateCpi }) => {
  const [multiplier, setMultiplier] = useState(1.0);
  const [fuelShock, setFuelShock] = useState(0);
  const [simResult, setSimResult] = useState(null);
  const [loading, setLoading] = useState(false);

  const current = simResult || cpiData || {
    cpi_base: "2024=100",
    apix_current: 100.43,
    airfare_movement_pct: 0.43,
    airfare_cpi_weight_pct: 0.07722,
    cpi_contribution_pp: 0.00033,
    illustrative_cpi: 100.00033,
    label: "Reference/Sensitivity (Not Official Current All-Commodity CPI)"
  };

  const handleSimulate = async () => {
    setLoading(true);
    try {
      if (onSimulateCpi) {
        const res = await onSimulateCpi(multiplier, fuelShock);
        setSimResult(res);
      }
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="space-y-6 pb-12">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between pb-4 border-b border-[#1E3145] gap-3">
        <div>
          <h2 className="text-xl font-bold text-[#F5F7FA] tracking-tight flex items-center gap-2">
            NSO Consumer Price Index (CPI) Sensitivity Engine
            <span className="text-xs font-mono font-normal px-2.5 py-0.5 rounded bg-[#35D07F]/10 text-[#35D07F] border border-[#35D07F]/30 font-semibold">
              Reference / Sensitivity Model
            </span>
          </h2>
          <p className="text-xs text-[#8FA3B8] mt-1">
            Mathematical transmission of high-frequency airfare movements into National Statistical Office (NSO) CPI basket
          </p>
        </div>
        <div className="bg-[#101D2D] px-3.5 py-1.5 rounded-md border border-[#1E3145] text-right">
          <span className="text-[10px] text-[#8FA3B8] uppercase font-bold">NSO Airfare Weight</span>
          <div className="text-sm font-mono font-bold text-[#35A7FF]">
            0.07722% of National Basket
          </div>
        </div>
      </div>

      {/* Official Required 5 Metrics Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-3.5">
        <div
          data-testid={TEST_IDS.CPI_CARD_BASE}
          className="bg-[#101D2D] border border-[#1E3145] p-4 rounded-lg flex flex-col justify-between"
        >
          <span className="text-xs text-[#8FA3B8] uppercase font-semibold">CPI Base Year</span>
          <div className="text-2xl font-bold font-mono text-[#F5F7FA] mt-1.5">
            2024 = 100
          </div>
          <span className="text-[10px] text-[#8FA3B8] font-mono border-t border-[#1E3145] pt-1.5 mt-2">
            NSO Benchmark Period
          </span>
        </div>

        <div
          data-testid={TEST_IDS.CPI_CARD_APIX}
          className="bg-[#101D2D] border border-[#1E3145] p-4 rounded-lg flex flex-col justify-between"
        >
          <span className="text-xs text-[#8FA3B8] uppercase font-semibold">APIx Airfare Index</span>
          <div className="text-2xl font-bold font-mono text-[#F5F7FA] mt-1.5">
            {current.apix_current}
          </div>
          <span className="text-[10px] text-[#FF5C6C] font-mono border-t border-[#1E3145] pt-1.5 mt-2">
            Shift: +{current.airfare_movement_pct}%
          </span>
        </div>

        <div
          data-testid={TEST_IDS.CPI_CARD_WEIGHT}
          className="bg-[#101D2D] border border-[#1E3145] p-4 rounded-lg flex flex-col justify-between"
        >
          <span className="text-xs text-[#8FA3B8] uppercase font-semibold">Reference Basket Weight</span>
          <div className="text-2xl font-bold font-mono text-[#35A7FF] mt-1.5">
            0.07722%
          </div>
          <span className="text-[10px] text-[#8FA3B8] font-mono border-t border-[#1E3145] pt-1.5 mt-2">
            Civil Aviation Weight
          </span>
        </div>

        <div
          data-testid={TEST_IDS.CPI_CARD_CONTRIBUTION}
          className="bg-[#101D2D] border border-[#1E3145] p-4 rounded-lg flex flex-col justify-between"
        >
          <span className="text-xs text-[#8FA3B8] uppercase font-semibold">Reference Contribution</span>
          <div className="text-2xl font-bold font-mono text-[#35D07F] mt-1.5">
            +{current.cpi_contribution_pp} pp
          </div>
          <span className="text-[10px] text-[#35D07F] font-mono border-t border-[#1E3145] pt-1.5 mt-2">
            Percentage Points Shift
          </span>
        </div>

        <div
          data-testid={TEST_IDS.CPI_CARD_ILLUSTRATIVE}
          className="bg-[#101D2D] border border-[#1E3145] p-4 rounded-lg flex flex-col justify-between"
        >
          <span className="text-xs text-[#8FA3B8] uppercase font-semibold">Illustrative Airfare CPI</span>
          <div className="text-2xl font-bold font-mono text-[#F5F7FA] mt-1.5">
            {current.illustrative_cpi}
          </div>
          <span className="text-[10px] text-[#8FA3B8] font-mono border-t border-[#1E3145] pt-1.5 mt-2">
            Baseline Component Only
          </span>
        </div>
      </div>

      {/* Mathematical Breakdown & Formula Card */}
      <div className="bg-[#101D2D] border border-[#1E3145] p-5 rounded-lg shadow-lg space-y-4">
        <div className="flex items-center justify-between pb-3 border-b border-[#1E3145]">
          <div className="flex items-center gap-2">
            <Calculator className="w-4 h-4 text-[#35A7FF]" />
            <h3 className="text-sm font-semibold uppercase tracking-wider text-[#F5F7FA]">
              Mathematical Transmission Formulation
            </h3>
          </div>
          <span className="text-xs font-mono text-[#F5B942] bg-[#08111F] px-2.5 py-0.5 rounded border border-[#1E3145]">
            Label: Reference / Sensitivity (Not Official All-Commodity CPI)
          </span>
        </div>

        <div className="bg-[#08111F] p-4 rounded-lg border border-[#1E3145] font-mono text-xs space-y-2">
          <div className="text-[#35A7FF] font-bold text-sm">
            Formula: ΔCPI = ΔAPIx × (w_airfare / 100)
          </div>
          <div className="text-[#8FA3B8] space-y-1">
            <div>• <strong>Step 1:</strong> Airfare Index Movement = <span className="text-[#FF5C6C]">+{current.airfare_movement_pct}%</span></div>
            <div>• <strong>Step 2:</strong> NSO Basket Weight = <span className="text-[#35A7FF]">0.07722%</span></div>
            <div>• <strong>Step 3:</strong> Calculated Sensitivity Contribution = (+0.43% × 0.07722%) / 100 = <span className="text-[#35D07F] font-bold">+{current.cpi_contribution_pp} percentage points</span></div>
            <div>• <strong>Step 4:</strong> Illustrative Baseline Airfare Component Index = 100.00 + 0.00033 = <span className="text-[#F5F7FA] font-bold">{current.illustrative_cpi}</span></div>
          </div>
        </div>
      </div>

      {/* Interactive Policy Shock Simulator */}
      <div className="bg-[#101D2D] border border-[#1E3145] p-5 rounded-lg shadow-lg space-y-4">
        <div className="flex items-center justify-between pb-3 border-b border-[#1E3145]">
          <div className="flex items-center gap-2">
            <Sliders className="w-4 h-4 text-[#35A7FF]" />
            <h3 className="text-sm font-semibold uppercase tracking-wider text-[#F5F7FA]">
              Interactive CPI Sensitivity Simulator
            </h3>
          </div>
          <span className="text-xs text-[#8FA3B8] font-mono">Real-Time Macro Scenario Testing</span>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 pt-2">
          <div className="space-y-4">
            <div>
              <div className="flex justify-between text-xs mb-1">
                <span className="text-[#8FA3B8]">ATF Fuel Price Surge (%):</span>
                <span className="font-mono text-[#FF5C6C] font-bold">+{fuelShock}%</span>
              </div>
              <input
                data-testid={TEST_IDS.CPI_FUEL_SHOCK_INPUT}
                type="range"
                min="0"
                max="40"
                step="5"
                value={fuelShock}
                onChange={(e) => setFuelShock(parseFloat(e.target.value))}
                className="w-full accent-[#35A7FF] cursor-pointer"
              />
            </div>

            <div>
              <div className="flex justify-between text-xs mb-1">
                <span className="text-[#8FA3B8]">Airfare Demand Shock Multiplier:</span>
                <span className="font-mono text-[#35A7FF] font-bold">{multiplier}x</span>
              </div>
              <input
                data-testid={TEST_IDS.CPI_SIMULATOR_SLIDER}
                type="range"
                min="0.5"
                max="3.0"
                step="0.5"
                value={multiplier}
                onChange={(e) => setMultiplier(parseFloat(e.target.value))}
                className="w-full accent-[#35A7FF] cursor-pointer"
              />
            </div>

            <button
              data-testid={TEST_IDS.CPI_SIMULATE_BTN}
              onClick={handleSimulate}
              disabled={loading}
              className="w-full py-2 bg-[#35A7FF] hover:bg-[#208fe6] text-[#08111F] font-bold text-xs rounded transition-colors font-mono flex items-center justify-center gap-2"
            >
              <Zap className="w-3.5 h-3.5" />
              {loading ? "Re-estimating..." : "Recalculate CPI Impact"}
            </button>
          </div>

          <div className="md:col-span-2 bg-[#08111F] p-4 rounded-lg border border-[#1E3145] flex flex-col justify-between">
            <div className="space-y-3">
              <h4 className="text-xs font-semibold text-[#F5F7FA] uppercase tracking-wider">
                Simulated Macroeconomic Sensitivity Result
              </h4>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <span className="text-[11px] text-[#8FA3B8]">Simulated APIx:</span>
                  <div className="text-2xl font-bold font-mono text-[#FF5C6C]">{current.apix_current}</div>
                </div>
                <div>
                  <span className="text-[11px] text-[#8FA3B8]">CPI Contribution:</span>
                  <div className="text-2xl font-bold font-mono text-[#35D07F]">+{current.cpi_contribution_pp} pp</div>
                </div>
              </div>
              <p className="text-xs text-[#8FA3B8] leading-relaxed">
                {current.policy_impact}
              </p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default CpiSensitivityView;