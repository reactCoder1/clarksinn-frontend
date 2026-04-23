import axios from "axios";

const api = axios.create({
  baseURL: process.env.REACT_APP_API_URL || "http://localhost:4000",
  headers: {
    "Content-Type": "application/json",
  },
});

export const adminLogin = (email, password) =>
  api.post("/admin/login", { email, password });

export const createCoupon = (payload, token) =>
  api.post("/admin/coupon/create", payload, {
    headers: {
      Authorization: `Bearer ${token}`,
    },
  });

export const fetchAdminCoupons = (token) =>
  api.get("/admin/coupons", {
    headers: {
      Authorization: `Bearer ${token}`,
    },
  });

export const fetchScannedLeads = (token) =>
  api.get("/admin/leads", {
    headers: {
      Authorization: `Bearer ${token}`,
    },
  });

export const fetchCouponDetails = (code) =>
  api.get(`/coupon/${encodeURIComponent(code)}`);

export const downloadCouponPdf = (code, options = {}) => {
  const params = new URLSearchParams();
  if (options.widthIn) params.append("widthIn", String(options.widthIn));
  if (options.heightIn) params.append("heightIn", String(options.heightIn));
  const query = params.toString();
  const suffix = `${encodeURIComponent(code)}/pdf${query ? `?${query}` : ""}`;
  const endpoints = [`coupon/${suffix}`];

  const uniqueEndpoints = [...new Set(endpoints)];

  const tryEndpoint = (index = 0) => {
    const endpoint = uniqueEndpoints[index];
    if (!endpoint) {
      throw new Error("PDF_FALLBACK_NEEDED");
    }

    return api.get(endpoint, { responseType: "blob" }).catch((error) => {
      if (error?.response?.status === 404) {
        return tryEndpoint(index + 1);
      }
      throw error;
    });
  };

  return tryEndpoint();
};

export const applyCoupon = (code, payload) =>
  api.post(`/coupon/${encodeURIComponent(code)}/apply`, payload);
