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

export const applyCoupon = (code, payload) =>
  api.post(`/coupon/${encodeURIComponent(code)}/apply`, payload);
