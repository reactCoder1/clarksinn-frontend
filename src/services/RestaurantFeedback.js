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

export const fetchPublicRestaurantFeedbackConfig = () =>
  api.get("/api/restaurant/feedback/config");

export const fetchAdminRestaurantFeedbackConfig = (token) =>
  api.get("/admin/restaurant/feedback/config", authHeaders(token));

export const generateRestaurantFeedbackQrPng = (sizePx, token) =>
  api.get("/admin/restaurant/feedback/qrcode/png", {
    ...authHeaders(token),
    params: { sizePx },
    responseType: "blob",
  });

export const logRestaurantFeedbackClick = (platform) =>
  api.post("/api/restaurant/feedback/click", { platform });

export const fetchRestaurantFeedbackClickSummary = (token) =>
  api.get("/admin/restaurant/feedback/clicks/summary", authHeaders(token));
