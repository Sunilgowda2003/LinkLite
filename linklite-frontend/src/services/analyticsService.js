
import api from "./api";

const analyticsService = {
  async getSummary() {
    const response = await api.get("/api/analytics/summary");
    return response.data;
  },

  async getDailyClicks(filters = {}) {
    const params = {};

    if (filters.range) params.range = filters.range;
    if (filters.startDate) params.startDate = filters.startDate;
    if (filters.endDate) params.endDate = filters.endDate;

    const response = await api.get("/api/analytics/daily", { params });
    return response.data;
  },

  async getTopUrls() {
    const response = await api.get("/api/analytics/top-urls");
    return response.data;
  },

  async getRecentClicks() {
  const response = await api.get("/api/analytics/recent-clicks");
  return response.data;
},

  async getRecentClicks() {
    const response = await api.get("/api/analytics/recent-clicks");
    return response.data;
  },

  async getUrlPerformanceComparison(filters = { range: "7d" }) {
  const response = await api.get("/api/analytics/comparison", {
    params: filters,
  });

  return response.data;
},


  async getUrlAnalytics(id) {
    const response = await api.get(`/api/analytics/urls/${id}`);
    return response.data;
  },
};



export default analyticsService;
