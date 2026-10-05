import React, { useState } from "react";
import { TEST_IDS } from "../constants/testIds";
import {
  Plane,
  ShieldCheck,
  TrendingUp,
  BarChart3,
  Layers,
  CheckCircle2,
  AlertCircle
} from "lucide-react";

export const AirlinesView = ({ airlines = [] }) => {
  const [filterType, setFilterType] = useState("all");

  const airlineList = airlines.length > 0 ? airlines : [
    { airline: "Air India", avg_fare: 5639.78, median_fare: 5013, observations: 47587, share_pct: 48.2, index: 100.4, min_fare: 2003, max_fare: 19877.2, reliability_score: 99.8 },
    { airline: "IndiGo", avg_fare: 5628.73, median_fare: 5020, observations: 22315, share_pct: 22.6, index: 100.2, min_fare: 2002, max_fare: 19874.4, reliability_score: 99.8 },
    { airline: "Vistara", avg_fare: 5671.12, median_fare: 5090, observations: 16185, share_pct: 16.4, index: 101.0, min_fare: 2001, max_fare: 19787.6, reliability_score: 99.5 },
    { airline: "SpiceJet", avg_fare: 5640.28, median_fare: 4950, observations: 9612, share_pct: 9.7, index: 100.4, min_fare: 2005, max_fare: 19874.4, reliability_score: 91.4 },
    { airline: "Fly91", avg_fare: 5617.14, median_fare: 4982, observations: 3023, share_pct: 3.1, index: 100.0, min_fare: 2065, max_fare: 19804.4, reliability_score: 99.2 }
  ];

  return (
    <div className="space-y-6 pb-12">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between pb-4 border-b border-[#1E3145] gap-3">
        <div>
          <h2 className="text-xl font-bold text-[#F5F7FA] tracking-tight flex items-center gap-2">
            Airline Price Intelligence & Competitive Breakdown
            <span className="text-xs font-mono font-normal px-2.5 py-0.5 rounded bg-[#35A7FF]/10 text-[#35A7FF] border border-[#35A7FF]/30">
              5 Carriers
            </span>
          </h2>
          <p className="text-xs text-[#8FA3B8] mt-1">
            Multi-airline tariff comparison, market share weights, and yield parity
          </p>
        </div>
        <div className="text-xs font-mono text-[#8FA3B8] bg-[#101D2D] px-3.5 py-1.5 rounded border border-[#1E3145]">
          Total Monitored Observations: <span className="text-[#35D07F] font-bold">98,722</span>
        </div>
      </div>

      {/* Small Multiples / Airline Cards Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-3.5">
        {airlineList.map((a) => (
          <div
            key={a.airline}
            className="bg-[#101D2D] border border-[#1E3145] rounded-lg p-4 shadow-md flex flex-col justify-between"
          >
            <div className="flex items-center justify-between">
              <span className="font-bold text-sm text-[#F5F7FA] truncate">{a.airline}</span>
              <span className="text-[10px] font-mono px-1.5 py-0.5 rounded bg-[#08111F] text-[#35A7FF] border border-[#1E3145]">
                {a.share_pct}%
              </span>
            </div>

            <div className="my-3 space-y-1">
              <div className="text-[11px] text-[#8FA3B8]">Average Fare</div>
              <div className="text-xl font-bold font-mono text-[#F5F7FA]">
                ₹{Math.round(a.avg_fare).toLocaleString()}
              </div>
              <div className="text-[11px] font-mono text-[#8FA3B8]">
                Median: ₹{Math.round(a.median_fare).toLocaleString()}
              </div>
            </div>

            <div className="text-[10px] text-[#8FA3B8] border-t border-[#1E3145] pt-2 space-y-1">
              <div className="flex justify-between">
                <span>Observations:</span>
                <span className="font-mono text-[#F5F7FA]">{a.observations?.toLocaleString()}</span>
              </div>
              <div className="flex justify-between">
                <span>Reliability:</span>
                <span className={`font-mono font-semibold ${a.reliability_score > 95 ? "text-[#35D07F]" : "text-[#F5B942]"}`}>
                  {a.reliability_score}%
                </span>
              </div>
            </div>
          </div>
        ))}
      </div>

      {/* Comparison Data Table */}
      <div
        data-testid={TEST_IDS.AIRLINES_TABLE}
        className="bg-[#101D2D] border border-[#1E3145] rounded-lg shadow-lg overflow-hidden"
      >
        <div className="p-4 border-b border-[#1E3145] flex items-center justify-between">
          <h3 className="text-sm font-semibold uppercase tracking-wider text-[#F5F7FA]">
            Detailed Airline Tariff Benchmark Table
          </h3>
          <span className="text-xs text-[#8FA3B8] font-mono">Filter: Economy Cabin Basket</span>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs">
            <thead className="bg-[#08111F] text-[#8FA3B8] uppercase font-mono text-[11px] border-b border-[#1E3145]">
              <tr>
                <th className="p-3.5">Airline</th>
                <th className="p-3.5">Average Fare</th>
                <th className="p-3.5">Median Fare</th>
                <th className="p-3.5">Fare Spread (Min - Max)</th>
                <th className="p-3.5">Observations</th>
                <th className="p-3.5">Basket Share</th>
                <th className="p-3.5">Carrier APIx</th>
                <th className="p-3.5">Status</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-[#1E3145] font-mono">
              {airlineList.map((a) => (
                <tr key={a.airline} className="hover:bg-[#16283D] transition-colors">
                  <td className="p-3.5 font-bold text-[#F5F7FA] flex items-center gap-2">
                    <Plane className="w-3.5 h-3.5 text-[#35A7FF]" />
                    {a.airline}
                  </td>
                  <td className="p-3.5 text-[#F5F7FA] font-semibold">
                    ₹{Math.round(a.avg_fare).toLocaleString()}
                  </td>
                  <td className="p-3.5 text-[#8FA3B8]">
                    ₹{Math.round(a.median_fare).toLocaleString()}
                  </td>
                  <td className="p-3.5 text-[#8FA3B8]">
                    ₹{Math.round(a.min_fare).toLocaleString()} – ₹{Math.round(a.max_fare).toLocaleString()}
                  </td>
                  <td className="p-3.5 text-[#F5F7FA]">
                    {a.observations?.toLocaleString()}
                  </td>
                  <td className="p-3.5 text-[#35A7FF] font-semibold">
                    {a.share_pct}%
                  </td>
                  <td className="p-3.5 text-[#35D07F]">
                    {a.index}
                  </td>
                  <td className="p-3.5">
                    <span
                      className={`text-[10px] px-2 py-0.5 rounded font-semibold ${
                        a.reliability_score > 95
                          ? "bg-[#35D07F]/10 text-[#35D07F] border border-[#35D07F]/30"
                          : "bg-[#F5B942]/10 text-[#F5B942] border border-[#F5B942]/30"
                      }`}
                    >
                      {a.reliability_score > 95 ? "● Full Coverage" : "● Partial Coverage"}
                    </span>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
};

export default AirlinesView;