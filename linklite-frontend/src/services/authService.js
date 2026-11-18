
import api from "./api";

const authService = {
  async register(userData) {
    const response = await api.post(
      "/api/auth/register",
      userData
    );

    return response.data;
  },

  async login(credentials) {
    const response = await api.post(
      "/api/auth/login",
      credentials
    );

    return response.data;
  },
};

export default authService;
