import React from "react";
import { TEST_IDS } from "../constants/testIds";
import {
  BookOpen,
  Calculator,
  ShieldCheck,
  Layers,
  CheckCircle2,
  FileText,
  Cpu
} from "lucide-react";

export const MethodologyView = () => {
  return (
    <div className="space-y-6 pb-12">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between pb-4 border-b border-[#1E3145] gap-3">
        <div>
          <h2 className="text-xl font-bold text-[#F5F7FA] tracking-tight flex items-center gap-2">
            Mathematical Methodology & Statistical Framework
            <span className="text-xs font-mono font-normal px-2.5 py-0.5 rounded bg-[#35A7FF]/10 text-[#35A7FF] border border-[#35A7FF]/30 font-semibold">
              Technical Specification
            </span>
          </h2>
          <p className="text-xs text-[#8FA3B8] mt-1">
            Mathematical formulations, DGCA passenger traffic weighting, and price index aggregation protocols
          </p>
        </div>
        <div className="text-xs font-mono text-[#35D07F] bg-[#101D2D] px-3.5 py-1.5 rounded border border-[#1E3145]">
          Standard: NSO / MoCA Aligned
        </div>
      </div>

      {/* Section 1: Basket Construction */}
      <div className="bg-[#101D2D] border border-[#1E3145] p-5 rounded-lg shadow-lg space-y-3">
        <div className="flex items-center gap-2 text-[#35A7FF] font-semibold text-sm uppercase tracking-wider">
          <Layers className="w-4 h-4" />
          <span>1. Representative Basket Construction</span>
        </div>
        <p className="text-xs text-[#8FA3B8] leading-relaxed">
          The national representative basket comprises <strong>36 domestic city-pair corridors</strong> connecting 17 major metropolitan and regional airports across North, South, East, West, and North-East zones. Corridors were selected using DGCA quarterly passenger carriage volume to capture &gt;80% of scheduled domestic airline traffic.
        </p>
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-2 pt-2 text-xs font-mono text-[#8FA3B8]">
          <div className="bg-[#08111F] p-2.5 rounded border border-[#1E3145]">
            <span className="text-[#35A7FF] font-bold">Metro-to-Metro</span>: 12 routes (e.g. DEL-BOM, BLR-MAA)
          </div>
          <div className="bg-[#08111F] p-2.5 rounded border border-[#1E3145]">
            <span className="text-[#35A7FF] font-bold">Metro-to-Tier 2</span>: 16 routes (e.g. DEL-PAT, BOM-GOI)
          </div>
          <div className="bg-[#08111F] p-2.5 rounded border border-[#1E3145]">
            <span className="text-[#35A7FF] font-bold">Regional Hubs</span>: 8 routes (e.g. CCU-GAU, HYD-MAA)
          </div>
          <div className="bg-[#08111F] p-2.5 rounded border border-[#1E3145]">
            <span className="text-[#35A7FF] font-bold">Monitored Airlines</span>: 5 Carriers
          </div>
        </div>
      </div>

      {/* Section 2: Index Formulation */}
      <div className="bg-[#101D2D] border border-[#1E3145] p-5 rounded-lg shadow-lg space-y-3">
        <div className="flex items-center gap-2 text-[#35A7FF] font-semibold text-sm uppercase tracking-wider">
          <Calculator className="w-4 h-4" />
          <span>2. Airfare Price Index (APIx) Formulation</span>
        </div>
        <p className="text-xs text-[#8FA3B8] leading-relaxed">
          The composite index is calculated at daily timestamp $t$ via weighted geometric aggregation:
        </p>
        <div className="bg-[#08111F] p-4 rounded-lg border border-[#1E3145] font-mono text-sm text-[#F5F7FA] space-y-2">
          <div className="text-[#35A7FF] font-bold">
            {"APIx_t = 100 × Σ ( wᵢ · ( Pᵢ,t / Pᵢ,0 ) )   for i = 1..N"}
          </div>
          <div className="text-xs text-[#8FA3B8] space-y-1">
            <div>• <strong>wᵢ:</strong> Fixed DGCA passenger-traffic weight for city-pair corridor i (Σ wᵢ = 1.0)</div>
            <div>• <strong>Pᵢ,t:</strong> Stratified average fare across booking horizons (T+1, T+7, T+15, T+30) on date t</div>
            <div>• <strong>Pᵢ,0:</strong> Baseline anchor price established on 25 August 2026 (APIx₀ = 100.00)</div>
          </div>
        </div>
      </div>

      {/* Section 3: Advance Booking Windows */}
      <div className="bg-[#101D2D] border border-[#1E3145] p-5 rounded-lg shadow-lg space-y-3">
        <div className="flex items-center gap-2 text-[#35A7FF] font-semibold text-sm uppercase tracking-wider">
          <FileText className="w-4 h-4" />
          <span>3. Advance Booking Windows & Stratification</span>
        </div>
        <div className="space-y-2 text-xs text-[#8FA3B8] leading-relaxed">
          <p>
            To avoid temporal bias from last-minute distress tickets vs early leisure tickets, prices are collected across 4 standardized lead-time buckets:
          </p>
          <ul className="list-disc list-inside space-y-1 font-mono text-[#F5F7FA]">
            <li><strong>T+1 (1 Day Prior):</strong> Emergency and last-minute corporate business travel (Median ₹4,850)</li>
            <li><strong>T+7 (7 Days Prior):</strong> Standard short-notice booking window (Median ₹4,766)</li>
            <li><strong>T+15 (15 Days Prior):</strong> Planned mid-horizon domestic travel (Median ₹5,177)</li>
            <li><strong>T+30 (30 Days Prior):</strong> Early advance purchase baseline window (Median ₹5,055)</li>
          </ul>
        </div>
      </div>

      {/* Section 4: Outlier Scrubbing */}
      <div className="bg-[#101D2D] border border-[#1E3145] p-5 rounded-lg shadow-lg space-y-3">
        <div className="flex items-center gap-2 text-[#35A7FF] font-semibold text-sm uppercase tracking-wider">
          <ShieldCheck className="w-4 h-4" />
          <span>4. Outlier Scrubbing & Data Quality Safeguards</span>
        </div>
        <p className="text-xs text-[#8FA3B8] leading-relaxed">
          Observations undergo schema verification and 1.5× Interquartile Range (IQR) boundary filtering per route and carrier stratum. Records where base fare, taxes, or total fare are corrupted or missing are logged and isolated (35 rejected null rows and 133 isolated outlier spikes out of 98,757 observations).
        </p>
      </div>
    </div>
  );
};

export default MethodologyView;