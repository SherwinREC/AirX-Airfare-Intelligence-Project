import React, { useState } from "react";
import { TEST_IDS } from "../../constants/testIds";
import { Plane, AlertTriangle, CheckCircle, Info } from "lucide-react";

// Geo bounds for India projection inside SVG (lat: 8°N to 34°N, lon: 68°E to 94°E)
const MAP_BOUNDS = {
  minLat: 7.5,
  maxLat: 34.5,
  minLon: 68.0,
  maxLon: 94.0,
  width: 600,
  height: 640
};

const project = (lat, lon) => {
  const x = ((lon - MAP_BOUNDS.minLon) / (MAP_BOUNDS.maxLon - MAP_BOUNDS.minLon)) * (MAP_BOUNDS.width - 80) + 40;
  const y = ((MAP_BOUNDS.maxLat - lat) / (MAP_BOUNDS.maxLat - MAP_BOUNDS.minLat)) * (MAP_BOUNDS.height - 80) + 40;
  return { x, y };
};

const AIRPORTS = {
  DEL: { name: "Delhi", lat: 28.5562, lon: 77.1000, code: "DEL", tier: "Metro" },
  BOM: { name: "Mumbai", lat: 19.0896, lon: 72.8656, code: "BOM", tier: "Metro" },
  BLR: { name: "Bengaluru", lat: 13.1986, lon: 77.7066, code: "BLR", tier: "Metro" },
  MAA: { name: "Chennai", lat: 12.9941, lon: 80.1709, code: "MAA", tier: "Metro" },
  CCU: { name: "Kolkata", lat: 22.6520, lon: 88.4467, code: "CCU", tier: "Metro" },
  HYD: { name: "Hyderabad", lat: 17.2403, lon: 78.4294, code: "HYD", tier: "Metro" },
  AMD: { name: "Ahmedabad", lat: 23.0772, lon: 72.6347, code: "AMD", tier: "Tier-2" },
  GOI: { name: "Goa", lat: 15.3800, lon: 73.8314, code: "GOI", tier: "Leisure" },
  BBI: { name: "Bhubaneswar", lat: 20.2444, lon: 85.8178, code: "BBI", tier: "Tier-2" },
  GAU: { name: "Guwahati", lat: 26.1061, lon: 91.5859, code: "GAU", tier: "Tier-2" },
  PNQ: { name: "Pune", lat: 18.5822, lon: 73.9197, code: "PNQ", tier: "Tier-2" },
  COK: { name: "Kochi", lat: 10.1518, lon: 76.4019, code: "COK", tier: "Tier-2" },
  JAI: { name: "Jaipur", lat: 26.8242, lon: 75.8122, code: "JAI", tier: "Tier-2" },
  LKO: { name: "Lucknow", lat: 26.7606, lon: 80.8893, code: "LKO", tier: "Tier-2" },
  PAT: { name: "Patna", lat: 25.5913, lon: 85.0880, code: "PAT", tier: "Tier-2" },
  IXC: { name: "Chandigarh", lat: 30.6735, lon: 76.7885, code: "IXC", tier: "Tier-2" },
  VNS: { name: "Varanasi", lat: 25.4524, lon: 82.8593, code: "VNS", tier: "Tier-2" }
};

// Primary key routes with status indicators
const MONITORED_CORRIDORS = [
  { from: "DEL", to: "BOM", status: "critical", label: "DEL-BOM", change: "+6.4%", avgFare: "₹7,420", index: 127.4, passengers: "High" },
  { from: "DEL", to: "BLR", status: "warning", label: "DEL-BLR", change: "+3.8%", avgFare: "₹6,840", index: 118.2, passengers: "High" },
  { from: "BLR", to: "MAA", status: "critical", label: "BLR-MAA", change: "+5.9%", avgFare: "₹5,893", index: 121.5, passengers: "High" },
  { from: "BOM", to: "BLR", status: "normal", label: "BOM-BLR", change: "-0.8%", avgFare: "₹4,950", index: 99.2, passengers: "High" },
  { from: "DEL", to: "CCU", status: "warning", label: "DEL-CCU", change: "+2.9%", avgFare: "₹5,620", index: 112.0, passengers: "High" },
  { from: "DEL", to: "HYD", status: "normal", label: "DEL-HYD", change: "+0.4%", avgFare: "₹5,200", index: 104.0, passengers: "Medium" },
  { from: "BOM", to: "GOI", status: "normal", label: "BOM-GOI", change: "+0.2%", avgFare: "₹3,980", index: 96.5, passengers: "High" },
  { from: "DEL", to: "AMD", status: "normal", label: "DEL-AMD", change: "-1.1%", avgFare: "₹4,129", index: 82.6, passengers: "Medium" },
  { from: "DEL", to: "PAT", status: "warning", label: "DEL-PAT", change: "+2.1%", avgFare: "₹5,180", index: 103.6, passengers: "Medium" },
  { from: "DEL", to: "GAU", status: "warning", label: "DEL-GAU", change: "+3.2%", avgFare: "₹6,150", index: 123.0, passengers: "Medium" },
  { from: "BOM", to: "COK", status: "normal", label: "BOM-COK", change: "+0.6%", avgFare: "₹4,850", index: 97.0, passengers: "Medium" },
  { from: "HYD", to: "MAA", status: "normal", label: "HYD-MAA", change: "-0.4%", avgFare: "₹4,300", index: 86.0, passengers: "Medium" }
];

export const IndiaRouteMap = ({ onSelectRoute, selectedRoute }) => {
  const [hoveredRoute, setHoveredRoute] = useState(null);
  const [hoveredAirport, setHoveredAirport] = useState(null);

  const getStatusColor = (status) => {
    if (status === "critical") return "#FF5C6C"; // Critical red
    if (status === "warning") return "#F5B942";  // Warning amber
    return "#35D07F";                            // Positive/normal green
  };

  return (
    <div
      data-testid={TEST_IDS.INDIA_MAP_CONTAINER}
      className="relative bg-[#101D2D] border border-[#1E3145] rounded-lg p-5 flex flex-col items-center shadow-lg"
    >
      {/* Header */}
      <div className="w-full flex items-center justify-between pb-3 border-b border-[#1E3145] mb-2">
        <div>
          <div className="flex items-center gap-2">
            <Plane className="w-4 h-4 text-[#35A7FF]" />
            <h3 className="text-sm font-semibold uppercase tracking-wider text-[#F5F7FA]">
              Domestic Airfare Pressure Map
            </h3>
          </div>
          <p className="text-xs text-[#8FA3B8] mt-0.5">
            Geospatial tariff intensity across 36 DGCA-weighted trunk sectors
          </p>
        </div>
        <div className="flex items-center gap-4 text-xs">
          <div className="flex items-center gap-1.5">
            <span className="w-2.5 h-2.5 rounded-full bg-[#FF5C6C]" />
            <span className="text-[#8FA3B8]">High Pressure</span>
          </div>
          <div className="flex items-center gap-1.5">
            <span className="w-2.5 h-2.5 rounded-full bg-[#F5B942]" />
            <span className="text-[#8FA3B8]">Moderate</span>
          </div>
          <div className="flex items-center gap-1.5">
            <span className="w-2.5 h-2.5 rounded-full bg-[#35D07F]" />
            <span className="text-[#8FA3B8]">Stable</span>
          </div>
        </div>
      </div>

      {/* SVG Canvas */}
      <div className="relative w-full max-w-[580px] h-[480px] flex items-center justify-center">
        <svg
          viewBox={`0 0 ${MAP_BOUNDS.width} ${MAP_BOUNDS.height}`}
          className="w-full h-full"
        >
          <defs>
            <radialGradient id="hubGlow" cx="50%" cy="50%" r="50%">
              <stop offset="0%" stopColor="#35A7FF" stopOpacity="0.8" />
              <stop offset="100%" stopColor="#35A7FF" stopOpacity="0" />
            </radialGradient>
            <filter id="glow">
              <feGaussianBlur stdDeviation="3" result="coloredBlur"/>
              <feMerge>
                <feMergeNode in="coloredBlur"/>
                <feMergeNode in="SourceGraphic"/>
              </feMerge>
            </filter>
          </defs>

          {/* Stylized India Coastline/Outline Base */}
          <path
            d="M 230 45 L 300 70 L 330 140 L 380 180 L 490 190 L 520 230 L 450 270 L 410 320 L 360 420 L 300 550 L 260 580 L 240 540 L 210 440 L 160 380 L 140 280 L 170 200 L 210 130 Z"
            fill="#08111F"
            stroke="#1E3145"
            strokeWidth="1.5"
            strokeDasharray="4 3"
            opacity="0.7"
          />

          {/* Route Corridors Arcs */}
          {MONITORED_CORRIDORS.map((corridor, idx) => {
            const from = AIRPORTS[corridor.from];
            const to = AIRPORTS[corridor.to];
            if (!from || !to) return null;
            const p1 = project(from.lat, from.lon);
            const p2 = project(to.lat, to.lon);
            const midX = (p1.x + p2.x) / 2;
            const midY = (p1.y + p2.y) / 2 - 25;
            const isHovered = hoveredRoute?.label === corridor.label;
            const isSelected = selectedRoute === corridor.label;
            const color = getStatusColor(corridor.status);

            return (
              <g key={idx} className="cursor-pointer">
                {/* Curve path */}
                <path
                  d={`M ${p1.x} ${p1.y} Q ${midX} ${midY} ${p2.x} ${p2.y}`}
                  fill="none"
                  stroke={color}
                  strokeWidth={isHovered || isSelected ? "3.5" : "1.8"}
                  strokeOpacity={isHovered || isSelected ? "1" : "0.55"}
                  filter={isHovered ? "url(#glow)" : undefined}
                  onMouseEnter={() => setHoveredRoute(corridor)}
                  onMouseLeave={() => setHoveredRoute(null)}
                  onClick={() => onSelectRoute && onSelectRoute(corridor.label)}
                />
              </g>
            );
          })}

          {/* Airport Nodes */}
          {Object.entries(AIRPORTS).map(([code, ap]) => {
            const { x, y } = project(ap.lat, ap.lon);
            const isMetro = ap.tier === "Metro";
            const isHovered = hoveredAirport?.code === code;

            return (
              <g
                key={code}
                className="cursor-pointer group"
                onMouseEnter={() => setHoveredAirport(ap)}
                onMouseLeave={() => setHoveredAirport(null)}
              >
                {/* Outer radar ring for metro hubs */}
                {isMetro && (
                  <circle
                    cx={x}
                    cy={y}
                    r="12"
                    fill="none"
                    stroke="#35A7FF"
                    strokeWidth="0.7"
                    strokeOpacity="0.4"
                    className="animate-pulse"
                  />
                )}
                {/* Core dot */}
                <circle
                  cx={x}
                  cy={y}
                  r={isMetro ? 5.5 : 4}
                  fill={isMetro ? "#35A7FF" : "#8FA3B8"}
                  stroke="#08111F"
                  strokeWidth="2"
                />
                {/* Airport code label */}
                <text
                  x={x + 7}
                  y={y + 3}
                  fill={isMetro ? "#F5F7FA" : "#8FA3B8"}
                  fontSize={isMetro ? "10" : "8.5"}
                  fontFamily="IBM Plex Mono"
                  fontWeight={isMetro ? "600" : "400"}
                >
                  {code}
                </text>
              </g>
            );
          })}
        </svg>

        {/* Interactive Floating Hover Popover */}
        {hoveredRoute && (
          <div className="absolute top-4 right-4 bg-[#08111F]/95 border border-[#1E3145] rounded-md p-3 shadow-xl backdrop-blur-md z-20 min-w-[200px]">
            <div className="flex items-center justify-between border-b border-[#1E3145] pb-1.5 mb-2">
              <span className="font-mono font-bold text-sm text-[#F5F7FA]">{hoveredRoute.label}</span>
              <span
                className="text-[10px] font-semibold px-1.5 py-0.5 rounded"
                style={{
                  backgroundColor: `${getStatusColor(hoveredRoute.status)}20`,
                  color: getStatusColor(hoveredRoute.status)
                }}
              >
                {hoveredRoute.status.toUpperCase()}
              </span>
            </div>
            <div className="space-y-1 text-xs">
              <div className="flex justify-between">
                <span className="text-[#8FA3B8]">Avg Fare:</span>
                <span className="font-mono text-[#F5F7FA] font-medium">{hoveredRoute.avgFare}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-[#8FA3B8]">Movement:</span>
                <span className="font-mono text-[#FF5C6C] font-semibold">{hoveredRoute.change}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-[#8FA3B8]">Route Index:</span>
                <span className="font-mono text-[#35A7FF] font-semibold">{hoveredRoute.index}</span>
              </div>
            </div>
          </div>
        )}
      </div>

      {/* Bottom Route Quick Strip */}
      <div className="w-full grid grid-cols-2 sm:grid-cols-4 gap-2 mt-2 pt-3 border-t border-[#1E3145]">
        <div className="bg-[#08111F] p-2 rounded border border-[#1E3145]/70 flex items-center justify-between">
          <span className="text-xs font-mono text-[#8FA3B8]">DEL → BOM</span>
          <span className="text-xs font-mono text-[#FF5C6C] font-bold">🔴 +6.4%</span>
        </div>
        <div className="bg-[#08111F] p-2 rounded border border-[#1E3145]/70 flex items-center justify-between">
          <span className="text-xs font-mono text-[#8FA3B8]">BLR → MAA</span>
          <span className="text-xs font-mono text-[#FF5C6C] font-bold">🔴 +5.9%</span>
        </div>
        <div className="bg-[#08111F] p-2 rounded border border-[#1E3145]/70 flex items-center justify-between">
          <span className="text-xs font-mono text-[#8FA3B8]">DEL → BLR</span>
          <span className="text-xs font-mono text-[#F5B942] font-bold">🟠 +3.8%</span>
        </div>
        <div className="bg-[#08111F] p-2 rounded border border-[#1E3145]/70 flex items-center justify-between">
          <span className="text-xs font-mono text-[#8FA3B8]">BOM → BLR</span>
          <span className="text-xs font-mono text-[#35D07F] font-bold">🟢 -0.8%</span>
        </div>
      </div>
    </div>
  );
};

export default IndiaRouteMap;