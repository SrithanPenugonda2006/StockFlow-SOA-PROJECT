import axios from "axios";

const API_BASE_URL = import.meta.env.VITE_API_BASE_URL || "http://localhost:8080";

export const apiClient = axios.create({
  baseURL: API_BASE_URL,
  headers: {
    "Content-Type": "application/json",
  },
});

// Request Interceptor: Attach JWT Bearer Token if available
apiClient.interceptors.request.use(
  (config) => {
    const isPublicAuthEndpoint = config.url && (
      config.url.includes("/api/auth/login") ||
      config.url.includes("/api/auth/register") ||
      config.url.includes("/api/auth/forgot-password") ||
      config.url.includes("/api/auth/reset-password") ||
      config.url.includes("/api/auth/send-otp") ||
      config.url.includes("/api/auth/verify-otp")
    );

    if (!isPublicAuthEndpoint) {
      const token = localStorage.getItem("omnistock_token");
      if (token) {
        const authHeader = "Bearer " + token;
        if (config.headers && typeof config.headers.set === "function") {
          config.headers.set("Authorization", authHeader);
        } else if (config.headers) {
          config.headers["Authorization"] = authHeader;
        }
      }
    }
    return config;
  },
  (error) => Promise.reject(error)
);

// Response Interceptor: Handle Token Expiration / 401 Unauthorized
apiClient.interceptors.response.use(
  (response) => response,
  (error) => {
    console.error("API Error:", error.response || error);
    if (error.response && error.response.status === 401) {
      const isAuthEndpoint = error.config?.url?.includes("/api/auth/");
      const hadToken = !!localStorage.getItem("omnistock_token");

      if (!isAuthEndpoint) {
        if (hadToken) {
          localStorage.removeItem("omnistock_token");
          localStorage.removeItem("omnistock_user");
        }

        const pathname = window.location.pathname;
        const isPublicPage =
          pathname === "/" ||
          pathname === "/products" ||
          pathname.startsWith("/products/") ||
          pathname === "/categories" ||
          pathname === "/brands" ||
          pathname === "/cart" ||
          pathname === "/customer/products" ||
          pathname.startsWith("/customer/products/") ||
          pathname === "/customer/cart" ||
          pathname.startsWith("/login") ||
          pathname.startsWith("/register") ||
          pathname.startsWith("/forgot-password") ||
          pathname.startsWith("/reset-password");

        // Only redirect to login with session expired flag if user was on a protected page
        if (!isPublicPage && hadToken) {
          window.location.href = "/login?expired=true";
        }
      }
    }
    return Promise.reject(error);
  }
);
