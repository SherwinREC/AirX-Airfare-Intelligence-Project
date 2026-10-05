import axios from "axios";

const BACKEND_URL = process.env.REACT_APP_BACKEND_URL || "http://localhost:8000";
const API = `${BACKEND_URL}/api`;

export const apiService = {
  getOverview: async () => {
    const res = await axios.get(`${API}/overview`);
    return res.data;
  },
  getIndexSeries: async (timeframe = "30D", aggregation = "daily") => {
    const res = await axios.get(`${API}/index-series`, { params: { timeframe, aggregation } });
    return res.data;
  },
  getRoutes: async () => {
    const res = await axios.get(`${API}/routes`);
    return res.data;
  },
  getRouteDetails: async (origin, destination) => {
    const res = await axios.get(`${API}/routes/${origin}/${destination}`);
    return res.data;
  },
  getLeadTime: async () => {
    const res = await axios.get(`${API}/lead-time`);
    return res.data;
  },
  getAirlines: async () => {
    const res = await axios.get(`${API}/airlines`);
    return res.data;
  },
  getFareComponents: async () => {
    const res = await axios.get(`${API}/fare-components`);
    return res.data;
  },
  getDataQuality: async () => {
    const res = await axios.get(`${API}/data-quality`);
    return res.data;
  },
  getValidation: async () => {
    const res = await axios.get(`${API}/validation`);
    return res.data;
  },
  getCpiSensitivity: async (multiplier = 1.0, fuelShock = 0.0) => {
    const res = await axios.get(`${API}/cpi-sensitivity`, { params: { multiplier, fuel_shock: fuelShock } });
    return res.data;
  },
  simulateCpi: async (multiplier = 1.0, fuel_shock_pct = 0.0) => {
    const res = await axios.post(`${API}/cpi-sensitivity/simulate`, { multiplier, fuel_shock_pct });
    return res.data;
  },
  getAlerts: async () => {
    const res = await axios.get(`${API}/alerts`);
    return res.data;
  },
  getRawData: async (params = {}) => {
    const res = await axios.get(`${API}/raw-data`, { params });
    return res.data;
  },
  triggerPipelineScrape: async () => {
    const res = await axios.post(`${API}/scraper/start`);
    return res.data;
  },
  startLiveScrape: async () => {
    const res = await axios.post(`${API}/scraper/start`);
    return res.data;
  },
  getScraperStatus: async () => {
    const res = await axios.get(`${API}/scraper/status`);
    return res.data;
  },
  explainMarketMovement: async (payload = {}) => {
    const res = await axios.post(`${API}/ai/explain`, payload);
    return res.data;
  }
};


export default apiService;