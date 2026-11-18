
import api from "./api";

const urlService = {
  async getUrls() {
    const response = await api.get("/api/urls");
    return response.data;
  },

  // Create URL with optional expiration and custom alias
  async createUrl(originalUrl, expiresAt = null, customAlias = null) {
    const response = await api.post("/api/urls", {
      originalUrl,
      expiresAt,
      customAlias: customAlias?.trim() || null,
    });

    return response.data;
  },

  // Get URL details
  async getUrlDetails(code) {
    const response = await api.get(`/api/urls/${code}`);
    return response.data;
  },

  // Get total URL count
  async getUrlCount() {
    const response = await api.get("/api/urls/stats/count");
    return response.data;
  },

  // Delete URL
  async deleteUrl(id) {
    await api.delete(`/api/urls/${id}`);
  },

  // Activate or deactivate URL
  async updateUrlStatus(id, active) {
    const response = await api.patch(`/api/urls/${id}/status`, {
      active,
    });

    return response.data;
  },

  // Update or remove URL expiration
  async updateUrlExpiration(id, expiresAt) {
    const response = await api.patch(`/api/urls/${id}/expiration`, {
      expiresAt,
    });

    return response.data;
  },

  // Update or remove custom alias
  async updateCustomAlias(id, customAlias) {
    const response = await api.patch(`/api/urls/${id}/alias`, {
      customAlias: customAlias?.trim() || null,
    });

    return response.data;
  },
};

export default urlService;
