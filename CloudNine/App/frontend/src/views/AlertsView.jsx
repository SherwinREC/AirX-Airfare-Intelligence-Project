import React from "react";
import { TEST_IDS } from "../constants/testIds";
import {
  AlertOctagon,
  AlertTriangle,
  Info,
  CheckCircle2,
  Clock,
  ArrowRight
} from "lucide-react";

export const AlertsView = ({ alerts = [], onSelectRoute }) => {
  const alertList = alerts.length > 0 ? alerts : [
    {
      id: "ALT-2026-001",
      severity: "CRITICAL",
      type: "Price Jump Alert",
      title: "DEL → BOM High-Density Surge",
      description: "DEL-BOM average fare increased 6.4% over the 48-hour cycle driven by last-minute business travel demand.",
      route: "DEL-BOM",
      timestamp: "2026-08-27 14:15 IST",
      status: "ACTIVE",
      action_recommended: "Monitor DGCA tariff compliance thresholds."
    },
    {
      id: "ALT-2026-002",
      severity: "WARNING",
      type: "Volatility Outlier",
      title: "BLR → MAA High Dispersion Alert",
      description: "Standard deviation on BLR-MAA widened to ₹2,450; heavy price variation across early morning vs late night flight slots.",
      route: "BLR-MAA",
      timestamp: "2026-08-27 11:30 IST",
      status: "INVESTIGATING",
      action_recommended: "Cross-reference with slot-level schedule cancellations."
    },
    {
      id: "ALT-2026-003",
      severity: "NOTICE",
      type: "Data Ingestion Notice",
      title: "SpiceJet Partial Source Coverage",
      description: "SpiceJet observations at 91.4% expected volume due to API rate-throttling on secondary regional sectors.",
      route: "ALL",
      timestamp: "2026-08-27 09:00 IST",
      status: "MITIGATED",
      action_recommended: "Automated exponential backoff retries scheduled."
    }
  ];

  return (
    <div data-testid={TEST_IDS.ALERTS_CONTAINER} className="space-y-6 pb-12">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between pb-4 border-b border-[#1E3145] gap-3">
        <div>
          <h2 className="text-xl font-bold text-[#F5F7FA] tracking-tight flex items-center gap-2">
            Anomaly Detection & Tariff Surveillance
            <span className="text-xs font-mono font-normal px-2.5 py-0.5 rounded bg-[#FF5C6C]/10 text-[#FF5C6C] border border-[#FF5C6C]/30 font-semibold">
              3 Monitored Events
            </span>
          </h2>
          <p className="text-xs text-[#8FA3B8] mt-1">
            Automated statistical tripwires detecting price surges, dispersion anomalies, and data feed drops
          </p>
        </div>
        <div className="text-xs font-mono text-[#35D07F] bg-[#101D2D] px-3.5 py-1.5 rounded border border-[#1E3145]">
          Surveillance Engine: ACTIVE
        </div>
      </div>

      {/* Alerts Stream */}
      <div className="space-y-4">
        {alertList.map((alt) => {
          const isCrit = alt.severity === "CRITICAL";
          const isWarn = alt.severity === "WARNING";
          const badgeColor = isCrit
            ? "bg-[#FF5C6C]/20 text-[#FF5C6C] border-[#FF5C6C]/40"
            : isWarn
            ? "bg-[#F5B942]/20 text-[#F5B942] border-[#F5B942]/40"
            : "bg-[#35A7FF]/20 text-[#35A7FF] border-[#35A7FF]/40";

          return (
            <div
              key={alt.id}
              className="bg-[#101D2D] border border-[#1E3145] p-5 rounded-lg shadow-md space-y-3"
            >
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 border-b border-[#1E3145] pb-3">
                <div className="flex items-center gap-2">
                  <span className={`text-[10px] font-mono font-bold px-2 py-0.5 rounded border ${badgeColor}`}>
                    {alt.severity}
                  </span>
                  <h3 className="text-sm font-bold text-[#F5F7FA]">{alt.title}</h3>
                </div>
                <div className="flex items-center gap-3 text-xs font-mono text-[#8FA3B8]">
                  <span>{alt.timestamp}</span>
                  <span className="text-[#35D07F]">● {alt.status}</span>
                </div>
              </div>

              <p className="text-xs text-[#8FA3B8] leading-relaxed">
                {alt.description}
              </p>

              <div className="p-3 bg-[#08111F] rounded border border-[#1E3145] flex flex-col sm:flex-row sm:items-center justify-between text-xs gap-2">
                <div className="text-[#F5F7FA] font-mono">
                  <span className="text-[#8FA3B8]">Action Recommended:</span> {alt.action_recommended}
                </div>
                {alt.route !== "ALL" && (
                  <button
                    onClick={() => onSelectRoute && onSelectRoute(alt.route)}
                    className="text-[#35A7FF] hover:underline font-mono text-xs flex items-center gap-1 shrink-0"
                  >
                    Inspect Route ({alt.route}) →
                  </button>
                )}
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
};

export default AlertsView;