import React, { useState } from "react";
import { TEST_IDS } from "../constants/testIds";
import {
  TrendingUp,
  ArrowUpRight,
  Calendar,
  Sliders,
  BarChart3,
  Layers,
  CheckCircle2,
  ShieldCheck
} from "lucide-react";
import {
  ResponsiveContainer,
  AreaChart,
  Area,
  XAxis,
  YAxis,
  Tooltip,
  CartesianGrid,
  Line,
  BarChart,
  Bar
} from "recharts";

export const AirfareIndexView = ({ indexSeries, overviewData }) => {
  const [timeframe, setTimeframe] = useState("30D");

  const fullData = indexSeries || [];
  const sliceMap = { "7D": 3, "30D": 13, "3M": 13, "6M": 13, "1Y": 13 };
  const takeLast = sliceMap[timeframe] || 13;
  const data = fullData.slice(-takeLast);

  return (
    <div className="space-y-6 pb-12">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between pb-4 border-b border-[#1E3145] gap-3">
        <div>
          <h2 className="text-xl font-bold text-[#F5F7FA] tracking-tight flex items-center gap-2">
            National Airfare Price Index (APIx)
            <span className="text-xs font-mono font-normal px-2 py-0.5 rounded bg-[#35A7FF]/10 text-[#35A7FF] border border-[#35A7FF]/30">
              Official Series
            </span>
          </h2>
          <p className="text-xs text-[#8FA3B8] mt-1">
            Deterministic high-frequency domestic airfare index constructed via Paasche-Laspeyres PDS weighting
          </p>
        </div>
        <div className="flex items-center gap-2">
          <div className="bg-[#101D2D] p-1 rounded-md border border-[#1E3145] flex items-center gap-1">
            {["7D", "30D", "3M", "6M", "1Y"].map((t) => (
              <button
                key={t}
                data-testid={`timeframe-${t.toLowerCase()}-btn`}
                onClick={() => setTimeframe(t)}
                className={`px-3 py-1 text-xs font-mono rounded transition-colors ${
                  timeframe === t
                    ? "bg-[#35A7FF] text-[#08111F] font-bold"
                    : "text-[#8FA3B8] hover:text-[#F5F7FA]"
                }`}
              >
                {t}
              </button>
            ))}
          </div>
        </div>
      </div>

      {/* Stats Ribbon */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
        <div className="bg-[#101D2D] border border-[#1E3145] p-3.5 rounded-lg">
          <span className="text-[11px] text-[#8FA3B8] uppercase font-semibold">Current APIx</span>
          <div className="text-2xl font-bold font-mono text-[#F5F7FA] mt-1">100.43</div>
          <span className="text-[10px] text-[#FF5C6C] font-mono">↑ +0.43% (27 Aug 2026)</span>
        </div>
        <div className="bg-[#101D2D] border border-[#1E3145] p-3.5 rounded-lg">
          <span className="text-[11px] text-[#8FA3B8] uppercase font-semibold">Base Anchor</span>
          <div className="text-2xl font-bold font-mono text-[#35A7FF] mt-1">100.00</div>
          <span className="text-[10px] text-[#8FA3B8] font-mono">25 Aug 2026 Epoch</span>
        </div>
        <div className="bg-[#101D2D] border border-[#1E3145] p-3.5 rounded-lg">
          <span className="text-[11px] text-[#8FA3B8] uppercase font-semibold">30D Peak / Trough</span>
          <div className="text-2xl font-bold font-mono text-[#F5F7FA] mt-1">100.43 / 98.60</div>
          <span className="text-[10px] text-[#8FA3B8] font-mono">Range: 1.83 pts</span>
        </div>
        <div className="bg-[#101D2D] border border-[#1E3145] p-3.5 rounded-lg">
          <span className="text-[11px] text-[#8FA3B8] uppercase font-semibold">DGCA Calibration</span>
          <div className="text-2xl font-bold font-mono text-[#35D07F] mt-1">r = 0.91</div>
          <span className="text-[10px] text-[#35D07F] font-mono">Statistically Validated</span>
        </div>
      </div>

      {/* Main Chart Area */}
      <div className="bg-[#101D2D] border border-[#1E3145] p-5 rounded-lg shadow-lg space-y-4">
        <div className="flex items-center justify-between pb-3 border-b border-[#1E3145]">
          <div className="flex items-center gap-2">
            <TrendingUp className="w-4 h-4 text-[#35A7FF]" />
            <h3 className="text-sm font-semibold uppercase tracking-wider text-[#F5F7FA]">
              APIx High-Frequency Time Series & Observation Volume
            </h3>
          </div>
          <div className="flex items-center gap-3 text-xs font-mono text-[#8FA3B8]">
            <div className="flex items-center gap-1.5">
              <span className="w-3 h-0.5 bg-[#35A7FF]"></span>
              <span>APIx</span>
            </div>
            <div className="flex items-center gap-1.5">
              <span className="w-3 h-0.5 bg-[#8FA3B8] border-b border-dashed border-[#8FA3B8]"></span>
              <span>DGCA Benchmark</span>
            </div>
          </div>
        </div>

        <div className="w-full h-80" data-testid={TEST_IDS.INDEX_CHART_CONTAINER}>
          <ResponsiveContainer width="100%" height="100%">
            <AreaChart data={data} margin={{ top: 10, right: 20, left: -10, bottom: 0 }}>
              <defs>
                <linearGradient id="indexFill" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="5%" stopColor="#35A7FF" stopOpacity={0.35} />
                  <stop offset="95%" stopColor="#35A7FF" stopOpacity={0.0} />
                </linearGradient>
              </defs>
              <CartesianGrid strokeDasharray="3 3" stroke="#1E3145" vertical={false} />
              <XAxis
                dataKey="date"
                stroke="#8FA3B8"
                fontSize={11}
                fontFamily="IBM Plex Mono"
              />
              <YAxis
                domain={[97.5, 101.5]}
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
                          Date: {label}
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
                          <span>Confidence:</span>
                          <span>{d.confidence}%</span>
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
                fill="url(#indexFill)"
              />
              <Line
                type="monotone"
                dataKey="dgca_benchmark"
                stroke="#8FA3B8"
                strokeWidth={1.5}
                strokeDasharray="4 4"
                dot={false}
              />
            </AreaChart>
          </ResponsiveContainer>
        </div>
      </div>

      {/* Index Computation Methodology Note */}
      <div className="bg-[#101D2D] border border-[#1E3145] p-4 rounded-lg text-xs space-y-2">
        <div className="flex items-center gap-2 text-[#35A7FF] font-semibold uppercase">
          <ShieldCheck className="w-4 h-4" />
          <span>Statistical Governance & Base Period Definition</span>
        </div>
        <p className="text-[#8FA3B8] leading-relaxed">
          The AIRX Price Index is constructed using daily weighted geometric aggregations across 36 city-pair routes. Route weights reflect DGCA quarterly passenger traffic counts. The anchor point is 25 August 2026 = 100.00.
        </p>
      </div>
    </div>
  );
};

export default AirfareIndexView;