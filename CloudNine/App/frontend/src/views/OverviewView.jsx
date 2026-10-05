import React, { useState, useEffect } from "react";
import { TEST_IDS } from "../constants/testIds";
import { IndiaRouteMap } from "../components/common/IndiaRouteMap";
import {
  TrendingUp,
  ArrowUpRight,
  ArrowDownRight,
  Activity,
  ShieldCheck,
  Layers,
  Sparkles,
  Bot,
  CheckCircle,
  Cpu,
  HelpCircle,
  AlertTriangle
} from "lucide-react";
import {
  ResponsiveContainer,
  LineChart,
  Line,
  XAxis,
  YAxis,
  Tooltip,
  CartesianGrid,
  Area,
  AreaChart
} from "recharts";

export const OverviewView = ({
  overviewData,
  indexSeries,
  onSelectRoute,
  onAiExplain,
  aiLoading,
  aiResponse
}) => {
  const [timeframe, setTimeframe] = useState("30D");
  const [aggregation, setAggregation] = useState("daily");
  const [useAi, setUseAi] = useState(true);
  const [aiProvider, setAiProvider] = useState("openai");

  const kpis = overviewData?.kpis || {
    apix: 100.43,
    apix_change_pct: 0.43,
    avg_fare: 5642,
    routes_tracked: 36,
    valid_observations: 98722,
    validity_rate: 99.965,
    confidence_level: "HIGH"
  };

  const drivers = overviewData?.drivers?.drivers || [
    { factor: "DEL → BOM Metro Trunk Surge", impact_pct: 0.16, share_of_change: 37.2 },
    { factor: "BLR → MAA High Yield Band", impact_pct: 0.12, share_of_change: 27.9 },
    { factor: "T+1 Short-Notice Surge Elasticity", impact_pct: 0.08, share_of_change: 18.6 },
    { factor: "ATF Cost Passthrough", impact_pct: 0.04, share_of_change: 9.3 },
    { factor: "Tier-2 Regional Dampening", impact_pct: 0.03, share_of_change: 7.0 }
  ];

  const chartData = indexSeries || [];

  return (
    <div className="space-y-6 pb-12">
      {/* Top Banner Context */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-2 border-b border-[#1E3145] pb-4">
        <div>
          <h1 className="text-2xl font-bold text-[#F5F7FA] tracking-tight flex items-center gap-2">
            Indian Airfare Price Index (APIx)
            <span className="text-xs font-mono font-normal px-2 py-0.5 rounded bg-[#35A7FF]/10 text-[#35A7FF] border border-[#35A7FF]/30">
              Base: 25 Aug 2026 = 100.00
            </span>
          </h1>
          <p className="text-xs text-[#8FA3B8] mt-1">
            Real-time monitoring of domestic airfare movements across 36 representative city-pairs
          </p>
        </div>
        <div className="flex items-center gap-3">
          <div className="text-right">
            <span className="text-[11px] uppercase tracking-wider text-[#8FA3B8] font-semibold">
              Scraped Epoch Status
            </span>
            <div className="text-xs font-mono text-[#35D07F] font-bold flex items-center justify-end gap-1.5">
              <span className="w-2 h-2 rounded-full bg-[#35D07F] animate-pulse"></span>
              27 AUG 2026 (64,125 Obs)
            </div>
          </div>
        </div>
      </div>

      {/* Hero KPI Cards Row (5 Cards) */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-3.5">
        {/* Card 1: APIx */}
        <div
          data-testid={TEST_IDS.KPI_APIX_CARD}
          className="bg-[#101D2D] border border-[#1E3145] rounded-lg p-4 shadow-md flex flex-col justify-between"
        >
          <div className="flex items-center justify-between text-[#8FA3B8] text-xs">
            <span className="font-semibold uppercase tracking-wider">National APIx</span>
            <span className="font-mono text-[10px] bg-[#08111F] px-1.5 py-0.5 rounded border border-[#1E3145]">
              PDS Weighted
            </span>
          </div>
          <div className="my-2">
            <div className="text-3xl font-bold font-mono text-[#F5F7FA]" data-testid={TEST_IDS.KPI_APIX_VALUE}>
              {kpis.apix}
            </div>
            <div className="flex items-center gap-1.5 mt-1 text-xs font-mono text-[#FF5C6C] font-semibold">
              <ArrowUpRight className="w-3.5 h-3.5" />
              <span>+{kpis.apix_change_pct}%</span>
              <span className="text-[#8FA3B8] font-normal text-[11px]">vs base (25 Aug)</span>
            </div>
          </div>
          <div className="text-[10px] text-[#8FA3B8] border-t border-[#1E3145]/60 pt-1.5">
            48h index delta: +0.43 pts
          </div>
        </div>

        {/* Card 2: Weekly Change */}
        <div
          data-testid={TEST_IDS.KPI_WEEKLY_CHANGE}
          className="bg-[#101D2D] border border-[#1E3145] rounded-lg p-4 shadow-md flex flex-col justify-between"
        >
          <div className="flex items-center justify-between text-[#8FA3B8] text-xs">
            <span className="font-semibold uppercase tracking-wider">Weekly Shift</span>
            <TrendingUp className="w-3.5 h-3.5 text-[#35A7FF]" />
          </div>
          <div className="my-2">
            <div className="text-3xl font-bold font-mono text-[#F5F7FA]">
              +0.43%
            </div>
            <div className="text-xs text-[#8FA3B8] mt-1">
              vs previous cycle
            </div>
          </div>
          <div className="text-[10px] text-[#8FA3B8] border-t border-[#1E3145]/60 pt-1.5">
            Direction: Moderate Uptick
          </div>
        </div>

        {/* Card 3: Average Fare */}
        <div
          data-testid={TEST_IDS.KPI_AVG_FARE}
          className="bg-[#101D2D] border border-[#1E3145] rounded-lg p-4 shadow-md flex flex-col justify-between"
        >
          <div className="flex items-center justify-between text-[#8FA3B8] text-xs">
            <span className="font-semibold uppercase tracking-wider">Representative Fare</span>
            <span className="text-[10px] font-mono text-[#8FA3B8]">Basket Mean</span>
          </div>
          <div className="my-2">
            <div className="text-3xl font-bold font-mono text-[#F5F7FA]">
              ₹5,642
            </div>
            <div className="text-xs font-mono text-[#8FA3B8] mt-1">
              Median: <span className="text-[#F5F7FA]">₹5,021</span>
            </div>
          </div>
          <div className="text-[10px] text-[#8FA3B8] border-t border-[#1E3145]/60 pt-1.5">
            Base: 82% | Tax: 15% | Fees: 3%
          </div>
        </div>

        {/* Card 4: Routes Tracked */}
        <div
          data-testid={TEST_IDS.KPI_ROUTES_TRACKED}
          className="bg-[#101D2D] border border-[#1E3145] rounded-lg p-4 shadow-md flex flex-col justify-between"
        >
          <div className="flex items-center justify-between text-[#8FA3B8] text-xs">
            <span className="font-semibold uppercase tracking-wider">Monitored Routes</span>
            <Layers className="w-3.5 h-3.5 text-[#35A7FF]" />
          </div>
          <div className="my-2">
            <div className="text-3xl font-bold font-mono text-[#F5F7FA]">
              36
            </div>
            <div className="text-xs text-[#8FA3B8] mt-1">
              5 Airlines · 4 Sources
            </div>
          </div>
          <div className="text-[10px] text-[#8FA3B8] border-t border-[#1E3145]/60 pt-1.5">
            17 Major & Tier-2 Hubs
          </div>
        </div>

        {/* Card 5: Data Confidence & Validity */}
        <div
          data-testid={TEST_IDS.KPI_DATA_CONFIDENCE}
          className="bg-[#101D2D] border border-[#1E3145] rounded-lg p-4 shadow-md flex flex-col justify-between"
        >
          <div className="flex items-center justify-between text-[#8FA3B8] text-xs">
            <span className="font-semibold uppercase tracking-wider">Data Confidence</span>
            <ShieldCheck className="w-3.5 h-3.5 text-[#35D07F]" />
          </div>
          <div className="my-2">
            <div className="text-3xl font-bold font-mono text-[#35D07F]">
              99.96%
            </div>
            <div className="text-xs font-mono text-[#8FA3B8] mt-1">
              98,722 / 98,757 Valid Obs
            </div>
          </div>
          <div className="text-[10px] text-[#8FA3B8] border-t border-[#1E3145]/60 pt-1.5 flex justify-between">
            <span>Outliers: 133 (0.18%)</span>
            <span className="text-[#35D07F] font-bold">● HIGH</span>
          </div>
        </div>
      </div>

      {/* Main Airfare Index Chart & Market Drivers Decomposition Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Main Chart (2 Cols) */}
        <div
          data-testid={TEST_IDS.INDEX_CHART_CONTAINER}
          className="lg:col-span-2 bg-[#101D2D] border border-[#1E3145] rounded-lg p-5 shadow-lg flex flex-col justify-between"
        >
          <div className="flex flex-col sm:flex-row sm:items-center justify-between pb-3 border-b border-[#1E3145] gap-3">
            <div>
              <div className="flex items-center gap-2">
                <TrendingUp className="w-4 h-4 text-[#35A7FF]" />
                <h3 className="text-sm font-semibold uppercase tracking-wider text-[#F5F7FA]">
                  Airfare Price Index (APIx) Trend
                </h3>
              </div>
              <p className="text-xs text-[#8FA3B8] mt-0.5">
                Calibrated with DGCA Benchmark Series · Base 100.00
              </p>
            </div>

            {/* Controls */}
            <div className="flex items-center gap-2">
              <div className="flex bg-[#08111F] p-0.5 rounded border border-[#1E3145]">
                {["7D", "30D", "3M", "6M", "1Y"].map((t) => (
                  <button
                    key={t}
                    data-testid={`timeframe-${t.toLowerCase()}-btn`}
                    onClick={() => setTimeframe(t)}
                    className={`px-2.5 py-1 text-xs font-mono rounded transition-colors ${
                      timeframe === t
                        ? "bg-[#35A7FF] text-[#08111F] font-bold"
                        : "text-[#8FA3B8] hover:text-[#F5F7FA]"
                    }`}
                  >
                    {t}
                  </button>
                ))}
              </div>

              <select
                data-testid={TEST_IDS.AGGREGATION_SELECT}
                value={aggregation}
                onChange={(e) => setAggregation(e.target.value)}
                className="bg-[#08111F] border border-[#1E3145] text-xs font-mono text-[#F5F7FA] px-2.5 py-1 rounded focus:outline-none focus:border-[#35A7FF]"
              >
                <option value="daily">Daily</option>
                <option value="weekly">Weekly</option>
                <option value="monthly">Monthly</option>
              </select>
            </div>
          </div>

          {/* Chart Canvas */}
          <div className="w-full h-72 my-3">
            <ResponsiveContainer width="100%" height="100%">
              <AreaChart data={chartData} margin={{ top: 15, right: 15, left: -20, bottom: 0 }}>
                <defs>
                  <linearGradient id="apixGradient" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="#35A7FF" stopOpacity={0.3} />
                    <stop offset="95%" stopColor="#35A7FF" stopOpacity={0.0} />
                  </linearGradient>
                </defs>
                <CartesianGrid strokeDasharray="3 3" stroke="#1E3145" vertical={false} />
                <XAxis
                  dataKey="date"
                  tickFormatter={(val) => val ? val.slice(5) : ""}
                  stroke="#8FA3B8"
                  fontSize={11}
                  fontFamily="IBM Plex Mono"
                />
                <YAxis
                  domain={[97, 102]}
                  stroke="#8FA3B8"
                  fontSize={11}
                  fontFamily="IBM Plex Mono"
                  tickFormatter={(val) => val.toFixed(1)}
                />
                <Tooltip
                  content={({ active, payload, label }) => {
                    if (active && payload && payload.length) {
                      const d = payload[0].payload;
                      return (
                        <div className="bg-[#08111F]/95 border border-[#1E3145] p-3 rounded shadow-xl text-xs font-mono">
                          <div className="text-[#8FA3B8] font-bold border-b border-[#1E3145] pb-1 mb-1.5">
                            Date: {label} {d.is_anchor ? "(Base Period Anchor)" : d.is_latest ? "(Latest Epoch)" : ""}
                          </div>
                          <div className="flex justify-between gap-4 text-[#35A7FF] font-semibold">
                            <span>APIx:</span>
                            <span>{d.apix.toFixed(2)}</span>
                          </div>
                          <div className="flex justify-between gap-4 text-[#8FA3B8]">
                            <span>DGCA Benchmark:</span>
                            <span>{d.dgca_benchmark.toFixed(2)}</span>
                          </div>
                          <div className="flex justify-between gap-4 text-[#8FA3B8] text-[10px]">
                            <span>Sample Volume:</span>
                            <span>{d.volume?.toLocaleString()} obs</span>
                          </div>
                        </div>
                      );
                    }
                    return null;
                  }}
                />
                <Area
                  type="monotone"
                  dataKey="apix"
                  stroke="#35A7FF"
                  strokeWidth={2.5}
                  fillOpacity={1}
                  fill="url(#apixGradient)"
                  name="APIx Index"
                />
                <Line
                  type="monotone"
                  dataKey="dgca_benchmark"
                  stroke="#8FA3B8"
                  strokeWidth={1.5}
                  strokeDasharray="4 4"
                  dot={false}
                  name="DGCA Benchmark"
                />
              </AreaChart>
            </ResponsiveContainer>
          </div>

          {/* Chart Footer Indicators */}
          <div className="flex flex-wrap items-center justify-between text-xs text-[#8FA3B8] pt-2 border-t border-[#1E3145]">
            <div className="flex items-center gap-4">
              <div className="flex items-center gap-1.5">
                <span className="w-3 h-0.5 bg-[#35A7FF]"></span>
                <span>APIx Primary Index (Base 100)</span>
              </div>
              <div className="flex items-center gap-1.5">
                <span className="w-3 h-0.5 bg-[#8FA3B8] border-b border-dashed border-[#8FA3B8]"></span>
                <span>DGCA Official Benchmark</span>
              </div>
            </div>
            <div className="font-mono text-[11px] text-[#35D07F]">
              Correlation: r = 0.91 (Strong Validation)
            </div>
          </div>
        </div>

        {/* Market Drivers & AI-Assisted Explanation Panel (1 Col) */}
        <div
          data-testid={TEST_IDS.DRIVERS_PANEL}
          className="bg-[#101D2D] border border-[#1E3145] rounded-lg p-5 shadow-lg flex flex-col justify-between"
        >
          <div>
            {/* Header with AI / Deterministic toggle */}
            <div className="flex items-center justify-between pb-3 border-b border-[#1E3145]">
              <div className="flex items-center gap-2">
                <Sparkles className="w-4 h-4 text-[#35A7FF]" />
                <h3 className="text-sm font-semibold uppercase tracking-wider text-[#F5F7FA]">
                  Why Did The Index Move?
                </h3>
              </div>
              <div className="flex items-center gap-1.5">
                <button
                  data-testid={TEST_IDS.DETERMINISTIC_TOGGLE}
                  onClick={() => setUseAi(!useAi)}
                  className={`text-[10px] font-mono px-2 py-0.5 rounded border transition-colors ${
                    useAi
                      ? "bg-[#35A7FF]/20 text-[#35A7FF] border-[#35A7FF]/40"
                      : "bg-[#08111F] text-[#8FA3B8] border-[#1E3145]"
                  }`}
                >
                  {useAi ? "AI + Stats" : "Pure Deterministic"}
                </button>
              </div>
            </div>

            {/* Main Movement Headline */}
            <div className="my-3 p-2.5 bg-[#08111F] rounded border border-[#1E3145] flex items-center justify-between">
              <span className="text-xs text-[#8FA3B8]">National Movement:</span>
              <span className="font-mono font-bold text-xs text-[#FF5C6C]">
                APIx ↑ +0.43% (100.00 → 100.43)
              </span>
            </div>

            {/* Quantitative Drivers Breakdown Bars */}
            <div className="space-y-2.5 my-3">
              {drivers.map((drv, i) => (
                <div key={i} className="space-y-1">
                  <div className="flex justify-between text-xs">
                    <span className="text-[#F5F7FA] font-medium truncate max-w-[180px]">
                      {drv.factor}
                    </span>
                    <span className="font-mono text-[#FF5C6C] font-semibold">
                      +{drv.impact_pct}% <span className="text-[#8FA3B8] font-normal">({drv.share_of_change}%)</span>
                    </span>
                  </div>
                  <div className="w-full h-1.5 bg-[#08111F] rounded-full overflow-hidden border border-[#1E3145]/60">
                    <div
                      className="h-full bg-[#35A7FF] rounded-full"
                      style={{ width: `${Math.min(100, drv.share_of_change * 2.2)}%` }}
                    />
                  </div>
                </div>
              ))}
            </div>

            {/* Explainable AI / Statistical Text Box */}
            <div
              data-testid={TEST_IDS.AI_INSIGHT_PANEL}
              className="mt-3 p-3 bg-[#08111F] rounded-lg border border-[#1E3145] text-xs space-y-2"
            >
              <div className="flex items-center justify-between border-b border-[#1E3145] pb-1.5">
                <span className="font-semibold text-[#8FA3B8] flex items-center gap-1.5">
                  <Bot className="w-3.5 h-3.5 text-[#35A7FF]" />
                  {useAi ? "AI Market Intelligence (OpenAI GPT-5.4)" : "Deterministic Economic Breakdown"}
                </span>
                <button
                  data-testid={TEST_IDS.AI_REFRESH_BTN}
                  onClick={() => onAiExplain && onAiExplain({ deterministic_only: !useAi, provider: aiProvider })}
                  disabled={aiLoading}
                  className="text-[10px] text-[#35A7FF] hover:underline font-mono"
                >
                  {aiLoading ? "Analysing..." : "Refresh"}
                </button>
              </div>
              <p className="text-[#8FA3B8] leading-relaxed text-[11px]">
                {aiResponse?.summary ||
                  "Airfare inflation was primarily driven by price increases on high-volume metro trunk routes, particularly DEL–BOM (+0.16% index impact) and BLR–MAA (+0.12%), coupled with short-notice T+1 booking elasticity."}
              </p>
            </div>
          </div>

          {/* Footer note on AI governance */}
          <div className="text-[10px] text-[#8FA3B8]/70 pt-2 border-t border-[#1E3145] mt-3 flex items-center justify-between">
            <span>Index calculation: 100% Deterministic</span>
            <span>AI role: Interpretive only</span>
          </div>
        </div>
      </div>

      {/* Domestic Airfare Pressure Map & Live Route Monitor */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <div className="lg:col-span-2">
          <IndiaRouteMap onSelectRoute={onSelectRoute} />
        </div>

        {/* Key Route Alerts & Quick Stats */}
        <div className="bg-[#101D2D] border border-[#1E3145] rounded-lg p-5 shadow-lg flex flex-col justify-between">
          <div>
            <div className="flex items-center justify-between pb-3 border-b border-[#1E3145]">
              <div className="flex items-center gap-2">
                <AlertTriangle className="w-4 h-4 text-[#F5B942]" />
                <h3 className="text-sm font-semibold uppercase tracking-wider text-[#F5F7FA]">
                  Route Pressure Watchlist
                </h3>
              </div>
              <span className="text-[10px] font-mono px-2 py-0.5 rounded bg-[#FF5C6C]/10 text-[#FF5C6C] border border-[#FF5C6C]/30">
                2 Alerts
              </span>
            </div>

            <div className="space-y-3 my-3">
              <div className="p-3 bg-[#08111F] rounded border border-[#FF5C6C]/40 space-y-1.5">
                <div className="flex justify-between items-center">
                  <span className="font-mono font-bold text-xs text-[#F5F7FA]">DEL → BOM</span>
                  <span className="text-[10px] font-mono px-1.5 py-0.5 rounded bg-[#FF5C6C]/20 text-[#FF5C6C] font-semibold">
                    HIGH PRESSURE (+6.4%)
                  </span>
                </div>
                <p className="text-[11px] text-[#8FA3B8]">
                  Average fare ₹7,420 vs basket mean ₹5,642. Last-minute capacity constraints on business departure slots.
                </p>
              </div>

              <div className="p-3 bg-[#08111F] rounded border border-[#F5B942]/40 space-y-1.5">
                <div className="flex justify-between items-center">
                  <span className="font-mono font-bold text-xs text-[#F5F7FA]">BLR → MAA</span>
                  <span className="text-[10px] font-mono px-1.5 py-0.5 rounded bg-[#F5B942]/20 text-[#F5B942] font-semibold">
                    VOLATILITY (+5.9%)
                  </span>
                </div>
                <p className="text-[11px] text-[#8FA3B8]">
                  Price dispersion across morning/evening slots widened. High standard deviation (₹2,450).
                </p>
              </div>

              <div className="p-3 bg-[#08111F] rounded border border-[#35D07F]/40 space-y-1.5">
                <div className="flex justify-between items-center">
                  <span className="font-mono font-bold text-xs text-[#F5F7FA]">BOM → BLR</span>
                  <span className="text-[10px] font-mono px-1.5 py-0.5 rounded bg-[#35D07F]/20 text-[#35D07F] font-semibold">
                    STABLE (-0.8%)
                  </span>
                </div>
                <p className="text-[11px] text-[#8FA3B8]">
                  Adequate seat availability (94.2%) across all 5 operating carriers.
                </p>
              </div>
            </div>
          </div>

          {/* Bottom Link to Full Route Intelligence */}
          <div className="pt-3 border-t border-[#1E3145]">
            <button
              onClick={() => onSelectRoute && onSelectRoute("DEL-BOM")}
              className="w-full py-2 bg-[#1E3145] hover:bg-[#35A7FF] hover:text-[#08111F] text-xs font-semibold rounded text-[#F5F7FA] transition-colors font-mono flex items-center justify-center gap-2"
            >
              Explore All 36 Route Corridors →
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default OverviewView;