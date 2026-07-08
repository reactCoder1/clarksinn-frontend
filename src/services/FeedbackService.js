import axios from "axios";

const api = axios.create({
  baseURL: process.env.REACT_APP_API_URL || "http://localhost:4000",
  headers: {
    "Content-Type": "application/json",
  },
});

const authHeaders = (token) => ({
  headers: {
    Authorization: `Bearer ${token}`,
  },
});

export const fetchPublicFeedbackConfig = () => api.get("/api/feedback/config");

export const fetchAdminFeedbackConfig = (token) =>
  api.get("/admin/feedback/config", authHeaders(token));

export const generateFeedbackQrPng = (sizePx, token) =>
  api.get("/admin/feedback/qrcode/png", {
    ...authHeaders(token),
    params: { sizePx },
    responseType: "blob",
  });

export const logFeedbackClick = (platform) =>
  api.post("/api/feedback/click", { platform });

export const fetchFeedbackClickSummary = (token) =>
  api.get("/admin/feedback/clicks/summary", authHeaders(token));
