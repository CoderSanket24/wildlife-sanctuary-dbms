import axios from "axios";

/**
 * Central axios instance for all API calls.
 * - baseURL  → backend server
 * - withCredentials → sends HTTP-only session cookies
 * - Automatic 1-retry on network errors (ERR_CONNECTION_RESET, ERR_NETWORK)
 *   This covers the cold-start DB connection pool case where the very first
 *   request gets reset before the pool is ready.
 */
const api = axios.create({
  baseURL: "http://localhost:5000/api",
  withCredentials: true,
  headers: {
    "Content-Type": "application/json",
  },
  timeout: 15000, // 15 s — prevents requests hanging forever
});

// ── Retry interceptor (1 retry on pure network failures) ──────────────────
api.interceptors.response.use(
  // Success — pass through unchanged
  (response) => response,

  // Error handler
  async (error) => {
    const config = error.config;

    // Only retry on network-level errors (no response received at all)
    // Do NOT retry on 4xx / 5xx — those are real API errors
    const isNetworkError = !error.response && (
      error.code === "ERR_NETWORK" ||
      error.code === "ERR_CONNECTION_RESET" ||
      error.code === "ECONNRESET" ||
      error.code === "ECONNABORTED" ||
      error.message === "Network Error"
    );

    // Retry once — prevent infinite loops with a flag
    if (isNetworkError && !config._retried) {
      config._retried = true;

      // Brief pause before retrying (gives the server a moment to be ready)
      await new Promise((resolve) => setTimeout(resolve, 800));

      return api(config);
    }

    return Promise.reject(error);
  }
);

export default api;