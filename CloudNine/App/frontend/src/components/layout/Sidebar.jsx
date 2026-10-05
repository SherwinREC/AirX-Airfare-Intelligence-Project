import React from "react";
import { TEST_IDS } from "../../constants/testIds";
import {
  LayoutDashboard,
  TrendingUp,
  MapPin,
  Clock,
  Plane,
  PieChart,
  Calculator,
  ShieldAlert,
  CheckCircle2,
  GitMerge,
  Database,
  AlertOctagon,
  BookOpen,
  Terminal,
  Landmark
} from "lucide-react";

export const Sidebar = ({ activeTab, setActiveTab, dashboardMode }) => {
  const navGroups = [
    {
      title: "CORE INTELLIGENCE",
      items: [
        {
          id: "overview",
          label: "Overview Pulse",
          icon: LayoutDashboard,
          testId: TEST_IDS.SIDEBAR_OVERVIEW,
          badge: "Hero"
        },
        {
          id: "airfare-index",
          label: "Airfare Index (APIx)",
          icon: TrendingUp,
          testId: TEST_IDS.SIDEBAR_AIRFARE_INDEX,
          value: "100.43"
        },
        {
          id: "route-intelligence",
          label: "Route Intelligence",
          icon: MapPin,
          testId: TEST_IDS.SIDEBAR_ROUTE_INTELLIGENCE,
          count: "36"
        },
        {
          id: "lead-time",
          label: "Lead-Time Analysis",
          icon: Clock,
          testId: TEST_IDS.SIDEBAR_LEAD_TIME,
          badge: "+18.4%"
        },
        {
          id: "airlines",
          label: "Airlines Breakdown",
          icon: Plane,
          testId: TEST_IDS.SIDEBAR_AIRLINES,
          count: "5"
        },
        {
          id: "fare-components",
          label: "Fare Components",
          icon: PieChart,
          testId: TEST_IDS.SIDEBAR_FARE_COMPONENTS,
          badge: "82/15/3"
        },
        {
          id: "cpi-sensitivity",
          label: "CPI Sensitivity",
          icon: Calculator,
          testId: TEST_IDS.SIDEBAR_CPI_SENSITIVITY,
          badge: "NSO/RBI",
          badgeColor: "text-[#35D07F] bg-[#35D07F]/10"
        }
      ]
    },
    {
      title: "DATA RIGOUR & AUDIT",
      items: [
        {
          id: "data-quality",
          label: "Data Quality & Coverage",
          icon: ShieldAlert,
          testId: TEST_IDS.SIDEBAR_DATA_QUALITY,
          badge: "99.96%"
        },
        {
          id: "validation",
          label: "30D Validation vs DGCA",
          icon: CheckCircle2,
          testId: TEST_IDS.SIDEBAR_VALIDATION,
          badge: "r=0.91"
        },
        {
          id: "pipeline",
          label: "Data Pipeline DAG",
          icon: GitMerge,
          testId: TEST_IDS.SIDEBAR_PIPELINE
        },
        {
          id: "raw-data",
          label: "Raw Data Explorer",
          icon: Database,
          testId: TEST_IDS.SIDEBAR_RAW_DATA,
          count: "98.7K"
        },
        {
          id: "alerts",
          label: "Anomaly Alerts",
          icon: AlertOctagon,
          testId: TEST_IDS.SIDEBAR_ALERTS,
          badge: "3 Active",
          badgeColor: "text-[#FF5C6C] bg-[#FF5C6C]/10"
        }
      ]
    },
    {
      title: "GOVERNANCE & API",
      items: [
        {
          id: "methodology",
          label: "Methodology & Formulas",
          icon: BookOpen,
          testId: TEST_IDS.SIDEBAR_METHODOLOGY
        },
        {
          id: "api",
          label: "REST API Explorer",
          icon: Terminal,
          testId: TEST_IDS.SIDEBAR_API_DOCS,
          badge: "v1.0"
        }
      ]
    }
  ];

  return (
    <aside
      data-testid={TEST_IDS.SIDEBAR}
      className="w-64 min-w-[16rem] bg-[#08111F] border-r border-[#1E3145] p-3 flex flex-col justify-between overflow-y-auto"
    >
      <div className="space-y-6">
        {navGroups.map((group, gIdx) => (
          <div key={gIdx} className="space-y-1">
            <div className="px-3 py-1 text-[11px] font-bold tracking-wider text-[#8FA3B8]/80 uppercase">
              {group.title}
            </div>
            <nav className="space-y-0.5">
              {group.items.map((item) => {
                const Icon = item.icon;
                const isActive = activeTab === item.id;
                return (
                  <button
                    key={item.id}
                    data-testid={item.testId}
                    onClick={() => setActiveTab(item.id)}
                    className={`w-full flex items-center justify-between px-3 py-2 rounded-md text-xs font-medium transition-colors ${
                      isActive
                        ? "bg-[#101D2D] text-[#35A7FF] font-semibold border-l-2 border-[#35A7FF]"
                        : "text-[#8FA3B8] hover:text-[#F5F7FA] hover:bg-[#101D2D]/60"
                    }`}
                  >
                    <div className="flex items-center gap-2.5 truncate">
                      <Icon className={`w-4 h-4 shrink-0 ${isActive ? "text-[#35A7FF]" : "text-[#8FA3B8]"}`} />
                      <span className="truncate">{item.label}</span>
                    </div>
                    {item.badge && (
                      <span
                        className={`text-[10px] font-mono px-1.5 py-0.5 rounded ${
                          item.badgeColor || (isActive ? "bg-[#35A7FF]/20 text-[#35A7FF]" : "bg-[#1E3145] text-[#8FA3B8]")
                        }`}
                      >
                        {item.badge}
                      </span>
                    )}
                    {item.count && (
                      <span className="text-[10px] font-mono text-[#8FA3B8] bg-[#101D2D] px-1.5 py-0.5 rounded border border-[#1E3145]">
                        {item.count}
                      </span>
                    )}
                    {item.value && (
                      <span className="text-[10px] font-mono font-bold text-[#35D07F]">
                        {item.value}
                      </span>
                    )}
                  </button>
                );
              })}
            </nav>
          </div>
        ))}
      </div>

      {/* System Footer Info */}
      <div className="pt-4 mt-6 border-t border-[#1E3145] text-[11px] text-[#8FA3B8] px-2 space-y-1">
        <div className="flex justify-between items-center">
          <span>Engine Status</span>
          <span className="text-[#35D07F] font-mono font-semibold">● ONLINE</span>
        </div>
        <div className="flex justify-between items-center text-[10px]">
          <span>Base Year</span>
          <span className="font-mono text-[#F5F7FA]">2024=100</span>
        </div>
        <div className="flex justify-between items-center text-[10px]">
          <span>Valid Sample</span>
          <span className="font-mono text-[#F5F7FA]">98,722 obs</span>
        </div>
      </div>
    </aside>
  );
};

export default Sidebar;