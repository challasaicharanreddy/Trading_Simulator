import axios from "axios";

const API_URL = import.meta.env.VITE_API_URL || "http://localhost:5000";

const axiosInstance = axios.create({
  baseURL: API_URL,
  withCredentials: true,
});

// Attach the current access token to every request
export function setupInterceptors(getAccessToken, refreshAccessToken, onRefreshFail) {
  axiosInstance.interceptors.request.use((config) => {
    const token = getAccessToken();
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
  });

  // On a 401, try refreshing once, then retry the original request
  axiosInstance.interceptors.response.use(
    (response) => response,
    async (error) => {
      const originalRequest = error.config;

      if (error.response?.status === 401 && !originalRequest._retry) {
        originalRequest._retry = true;
        try {
          await refreshAccessToken();
          return axiosInstance(originalRequest);
        } catch (refreshError) {
          onRefreshFail?.();
          return Promise.reject(refreshError);
        }
      }

      return Promise.reject(error);
    }
  );
}

export default axiosInstance;