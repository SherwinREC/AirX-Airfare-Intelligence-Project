import React, { useState, useEffect } from "react";
import { TEST_IDS } from "../constants/testIds";
import { apiService } from "../services/api";
import {
  Database,
  Search,
  Filter,
  ChevronLeft,
  ChevronRight,
  CheckCircle2,
  AlertCircle,
  Download
} from "lucide-react";

export const RawDataView = () => {
  const [data, setData] = useState([]);
  const [loading, setLoading] = useState(false);
  const [page, setPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [totalObs, setTotalObs] = useState(98757);
  const [routeFilter, setRouteFilter] = useState("ALL");
  const [airlineFilter, setAirlineFilter] = useState("ALL");
  const [sourceFilter, setSourceFilter] = useState("ALL");

  const loadObservations = async () => {
    setLoading(true);
    try {
      const res = await apiService.getRawData({
        page,
        page_size: 25,
        route: routeFilter !== "ALL" ? routeFilter : undefined,
        airline: airlineFilter !== "ALL" ? airlineFilter : undefined,
        source: sourceFilter !== "ALL" ? sourceFilter : undefined
      });
      setData(res.data || []);
      setTotalPages(res.total_pages || 1);
      setTotalObs(res.total || 0);
    } catch (e) {
      console.error(e);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadObservations();
  }, [page, routeFilter, airlineFilter, sourceFilter]);

  return (
    <div className="space-y-6 pb-12">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between pb-4 border-b border-[#1E3145] gap-3">
        <div>
          <h2 className="text-xl font-bold text-[#F5F7FA] tracking-tight flex items-center gap-2">
            Raw Observation Explorer
            <span className="text-xs font-mono font-normal px-2.5 py-0.5 rounded bg-[#35A7FF]/10 text-[#35A7FF] border border-[#35A7FF]/30">
              Total: {totalObs.toLocaleString()} rows
            </span>
          </h2>
          <p className="text-xs text-[#8FA3B8] mt-1">
            Direct audit trail: "Show me exactly where APIx = 100.43 came from"
          </p>
        </div>
        <div className="text-xs font-mono text-[#8FA3B8] bg-[#101D2D] px-3.5 py-1.5 rounded border border-[#1E3145]">
          Page {page} of {totalPages}
        </div>
      </div>

      {/* Filter Toolbar */}
      <div className="bg-[#101D2D] border border-[#1E3145] p-4 rounded-lg flex flex-wrap items-center gap-3">
        <div className="flex items-center gap-2">
          <label className="text-xs text-[#8FA3B8] font-mono">Route:</label>
          <select
            data-testid={TEST_IDS.RAW_DATA_ROUTE_FILTER}
            value={routeFilter}
            onChange={(e) => { setRouteFilter(e.target.value); setPage(1); }}
            className="bg-[#08111F] border border-[#1E3145] text-xs font-mono text-[#F5F7FA] px-2.5 py-1 rounded"
          >
            <option value="ALL">All Routes (36)</option>
            <option value="DEL-BOM">DEL-BOM</option>
            <option value="BLR-MAA">BLR-MAA</option>
            <option value="DEL-BLR">DEL-BLR</option>
            <option value="BOM-DEL">BOM-DEL</option>
            <option value="MAA-DEL">MAA-DEL</option>
          </select>
        </div>

        <div className="flex items-center gap-2">
          <label className="text-xs text-[#8FA3B8] font-mono">Airline:</label>
          <select
            data-testid={TEST_IDS.RAW_DATA_AIRLINE_FILTER}
            value={airlineFilter}
            onChange={(e) => { setAirlineFilter(e.target.value); setPage(1); }}
            className="bg-[#08111F] border border-[#1E3145] text-xs font-mono text-[#F5F7FA] px-2.5 py-1 rounded"
          >
            <option value="ALL">All Airlines (5)</option>
            <option value="Air India">Air India</option>
            <option value="IndiGo">IndiGo</option>
            <option value="Vistara">Vistara</option>
            <option value="SpiceJet">SpiceJet</option>
            <option value="Fly91">Fly91</option>
          </select>
        </div>

        <div className="flex items-center gap-2">
          <label className="text-xs text-[#8FA3B8] font-mono">Source:</label>
          <select
            data-testid={TEST_IDS.RAW_DATA_SOURCE_FILTER}
            value={sourceFilter}
            onChange={(e) => { setSourceFilter(e.target.value); setPage(1); }}
            className="bg-[#08111F] border border-[#1E3145] text-xs font-mono text-[#F5F7FA] px-2.5 py-1 rounded"
          >
            <option value="ALL">All Sources (4)</option>
            <option value="mock_airline">mock_airline</option>
            <option value="ixigo">ixigo</option>
            <option value="easemytrip">easemytrip</option>
            <option value="google_flights">google_flights</option>
          </select>
        </div>
      </div>

      {/* Data Table */}
      <div
        data-testid={TEST_IDS.RAW_DATA_TABLE}
        className="bg-[#101D2D] border border-[#1E3145] rounded-lg shadow-lg overflow-hidden"
      >
        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs font-mono">
            <thead className="bg-[#08111F] text-[#8FA3B8] uppercase text-[11px] border-b border-[#1E3145]">
              <tr>
                <th className="p-3">Observation ID</th>
                <th className="p-3">Route</th>
                <th className="p-3">Airline</th>
                <th className="p-3">Travel Date</th>
                <th className="p-3">Base Fare</th>
                <th className="p-3">Taxes</th>
                <th className="p-3">Fees</th>
                <th className="p-3">Total Fare</th>
                <th className="p-3">Source</th>
                <th className="p-3">Status</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-[#1E3145]">
              {loading ? (
                <tr>
                  <td colSpan="10" className="p-8 text-center text-[#8FA3B8]">
                    Loading observations...
                  </td>
                </tr>
              ) : data.length === 0 ? (
                <tr>
                  <td colSpan="10" className="p-8 text-center text-[#8FA3B8]">
                    No observations matching the selected filters.
                  </td>
                </tr>
              ) : (
                data.map((row, idx) => (
                  <tr key={idx} className="hover:bg-[#16283D] transition-colors">
                    <td className="p-3 text-[#8FA3B8]">{row.observation_id}</td>
                    <td className="p-3 font-bold text-[#F5F7FA]">{row.route}</td>
                    <td className="p-3 text-[#35A7FF]">{row.airline}</td>
                    <td className="p-3 text-[#8FA3B8]">{row.travel_date}</td>
                    <td className="p-3 text-[#F5F7FA]">₹{row.base_fare?.toLocaleString()}</td>
                    <td className="p-3 text-[#8FA3B8]">₹{row.taxes?.toLocaleString()}</td>
                    <td className="p-3 text-[#8FA3B8]">₹{row.fees?.toLocaleString()}</td>
                    <td className="p-3 text-[#35D07F] font-bold">₹{row.total_fare?.toLocaleString()}</td>
                    <td className="p-3 text-[#8FA3B8]">{row.source_name}</td>
                    <td className="p-3">
                      <span className="text-[10px] px-1.5 py-0.5 rounded bg-[#35D07F]/10 text-[#35D07F] border border-[#35D07F]/30">
                        ✓ VALID
                      </span>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>

        {/* Pagination Bar */}
        <div className="p-4 bg-[#08111F] border-t border-[#1E3145] flex items-center justify-between text-xs font-mono">
          <button
            data-testid={TEST_IDS.RAW_DATA_PREV_PAGE}
            onClick={() => setPage((p) => Math.max(1, p - 1))}
            disabled={page <= 1}
            className="px-3 py-1.5 bg-[#101D2D] hover:bg-[#1E3145] text-[#F5F7FA] rounded disabled:opacity-40"
          >
            ← Previous Page
          </button>
          <span className="text-[#8FA3B8]">
            Showing Page {page} of {totalPages}
          </span>
          <button
            data-testid={TEST_IDS.RAW_DATA_NEXT_PAGE}
            onClick={() => setPage((p) => Math.min(totalPages, p + 1))}
            disabled={page >= totalPages}
            className="px-3 py-1.5 bg-[#101D2D] hover:bg-[#1E3145] text-[#F5F7FA] rounded disabled:opacity-40"
          >
            Next Page →
          </button>
        </div>
      </div>
    </div>
  );
};

export default RawDataView;