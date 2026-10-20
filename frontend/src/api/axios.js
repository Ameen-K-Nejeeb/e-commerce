import axios from "axios";

const api = axios.create({
  baseURL: "http://127.0.0.1:8000/api/",
  headers: {
    "Content-Type": "application/json",
  },
});

/**
 * Request Interceptor:
 * Before every outgoing HTTP request, grab the access_token from localStorage
 * and attach it as a Bearer token in the Authorization header.
 */
api.interceptors.request.use(
  (config) => {
    const token = localStorage.getItem("access_token");
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
  },
  (error) => Promise.reject(error),
);

/**
 * Response Interceptor (Auto Token Refresh):
 * If Django returns 401 Unauthorized (because the 15-minute access token expired),
 * this interceptor pauses the failure, calls /api/auth/token/refresh/ using the
 * longer-lived refresh token, updates storage, and replays the original failed call.
 */

api.interceptors.response.use(
  (response) => response,
  async (error) => {
    const originalRequest = error.config;

    // Detect 401 and prevent infinite loop if refresh itself fails
    if (error.response?.status === 401 && !originalRequest._retry) {
      originalRequest._retry = true;
      const refreshToken = localStorage.getItem('refresh_token');

      if (refreshToken) {
        try {
          const res = await axios.post('http://127.0.0.1:8000/api/auth/token/refresh/', {
            refresh: refreshToken,
          });

          const newAccessToken = res.data.access;
          localStorage.setItem('access_token', newAccessToken);

          // Retry the original query with the new access token
          originalRequest.headers.Authorization = `Bearer ${newAccessToken}`;
          return api(originalRequest);
        } catch (refreshErr) {
          // If refresh token is expired or invalid, log out completely
          localStorage.removeItem('access_token');
          localStorage.removeItem('refresh_token');
          localStorage.removeItem('user');
          window.location.href = '/login';
        }
      }
    }
    return Promise.reject(error);
  }
);

export default api;
