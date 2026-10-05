import React from "react";
import { TEST_IDS } from "../constants/testIds";
import {
  PieChart,
  ShieldCheck,
  DollarSign,
  Layers,
  Info,
  HelpCircle
} from "lucide-react";

export const FareComponentsView = ({ fareComponents }) => {
  const components = fareComponents?.components_table || [
    { component: "Base Fare", amount: 4626, share: 82.0, code: "BASE", description: "Core airline tariff calculated by distance, cabin inventory & yield curves" },
    { component: "Taxes & Statutory Surcharges", amount: 846, share: 15.0, code: "TAX_GST", description: "Statutory GST (5% Economy / 12% Business) and aviation security fees" },
    { component: "Airport Fees & UDF", amount: 169, share: 3.0, code: "UDF_PSF", description: "User Development Fee (UDF) & Passenger Service Fee (PSF) charged by airport operators" }
  ];

  return (
    <div className="space-y-6 pb-12">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between pb-4 border-b border-[#1E3145] gap-3">
        <div>
          <h2 className="text-xl font-bold text-[#F5F7FA] tracking-tight flex items-center gap-2">
            Fare Component Decomposition
            <span className="text-xs font-mono font-normal px-2.5 py-0.5 rounded bg-[#35A7FF]/10 text-[#35A7FF] border border-[#35A7FF]/30">
              Tariff Anatomy
            </span>
          </h2>
          <p className="text-xs text-[#8FA3B8] mt-1">
            Breakdown of total airfare into Base Tariff, GST Taxes, and Airport User Development Fees (UDF/PSF)
          </p>
        </div>
        <div className="bg-[#101D2D] px-3.5 py-1.5 rounded-md border border-[#1E3145] text-right">
          <span className="text-[10px] text-[#8FA3B8] uppercase font-bold">Total Average Fare</span>
          <div className="text-sm font-mono font-bold text-[#F5F7FA]">
            ₹5,642 (100.0%)
          </div>
        </div>
      </div>

      {/* Stacked Fare Visual Bar Card */}
      <div
        data-testid={TEST_IDS.FARE_STACKED_BAR}
        className="bg-[#101D2D] border border-[#1E3145] p-5 rounded-lg shadow-lg space-y-4"
      >
        <div className="flex justify-between items-center pb-2 border-b border-[#1E3145]">
          <h3 className="text-sm font-semibold uppercase tracking-wider text-[#F5F7FA]">
            National Representative Fare Composition
          </h3>
          <span className="text-xs font-mono text-[#35D07F]">98,722 Valid Observations</span>
        </div>

        {/* Stacked visual representation */}
        <div className="space-y-2">
          <div className="w-full h-9 bg-[#08111F] rounded-lg overflow-hidden flex border border-[#1E3145]">
            <div
              style={{ width: "82%" }}
              className="h-full bg-[#35A7FF] flex items-center justify-center text-[#08111F] font-mono text-xs font-bold transition-all hover:opacity-90 cursor-pointer"
              title="Base Fare: 82%"
            >
              Base Fare (82.0%)
            </div>
            <div
              style={{ width: "15%" }}
              className="h-full bg-[#F5B942] flex items-center justify-center text-[#08111F] font-mono text-xs font-bold transition-all hover:opacity-90 cursor-pointer"
              title="Taxes & GST: 15%"
            >
              Taxes (15.0%)
            </div>
            <div
              style={{ width: "3%" }}
              className="h-full bg-[#35D07F] flex items-center justify-center text-[#08111F] font-mono text-[10px] font-bold transition-all hover:opacity-90 cursor-pointer"
              title="Airport Fees: 3%"
            >
              UDF (3%)
            </div>
          </div>

          {/* Key Indicators */}
          <div className="flex flex-wrap items-center justify-between text-xs pt-2">
            <div className="flex items-center gap-2">
              <span className="w-3 h-3 rounded-full bg-[#35A7FF]" />
              <span className="text-[#8FA3B8]">Base Fare: <strong data-testid={TEST_IDS.BASE_FARE_SHARE} className="text-[#F5F7FA] font-mono">₹4,626 (82%)</strong></span>
            </div>
            <div className="flex items-center gap-2">
              <span className="w-3 h-3 rounded-full bg-[#F5B942]" />
              <span className="text-[#8FA3B8]">Taxes & Surcharges: <strong data-testid={TEST_IDS.TAX_FARE_SHARE} className="text-[#F5F7FA] font-mono">₹846 (15%)</strong></span>
            </div>
            <div className="flex items-center gap-2">
              <span className="w-3 h-3 rounded-full bg-[#35D07F]" />
              <span className="text-[#8FA3B8]">Airport Fees & UDF: <strong data-testid={TEST_IDS.FEE_FARE_SHARE} className="text-[#F5F7FA] font-mono">₹169 (3%)</strong></span>
            </div>
          </div>
        </div>
      </div>

      {/* Detailed Components Table */}
      <div className="bg-[#101D2D] border border-[#1E3145] rounded-lg shadow-lg overflow-hidden">
        <div className="p-4 border-b border-[#1E3145]">
          <h3 className="text-sm font-semibold uppercase tracking-wider text-[#F5F7FA]">
            Statutory Tariff Component Specifications
          </h3>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs">
            <thead className="bg-[#08111F] text-[#8FA3B8] uppercase font-mono text-[11px] border-b border-[#1E3145]">
              <tr>
                <th className="p-3.5">Component</th>
                <th className="p-3.5">Code</th>
                <th className="p-3.5">Average Amount</th>
                <th className="p-3.5">Share of Total</th>
                <th className="p-3.5">Regulatory Description</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-[#1E3145] font-mono">
              {components.map((c, i) => (
                <tr key={i} className="hover:bg-[#16283D] transition-colors">
                  <td className="p-3.5 font-bold text-[#F5F7FA]">
                    {c.component}
                  </td>
                  <td className="p-3.5 text-[#35A7FF]">
                    {c.code}
                  </td>
                  <td className="p-3.5 text-[#F5F7FA] font-semibold">
                    ₹{c.amount?.toLocaleString()}
                  </td>
                  <td className="p-3.5 text-[#35D07F] font-semibold">
                    {c.share}%
                  </td>
                  <td className="p-3.5 text-[#8FA3B8] font-sans">
                    {c.description}
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

export default FareComponentsView;