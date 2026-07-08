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
  api.get("/restaurant/api/feedback/config");

export const fetchAdminRestaurantFeedbackConfig = (token) =>
  api.get("/restaurant/admin/feedback/config", authHeaders(token));

export const generateRestaurantFeedbackQrPng = (sizePx, token) =>
  api.get("/restaurant/admin/feedback/qrcode/png", {
    ...authHeaders(token),
    params: { sizePx },
    responseType: "blob",
  });

export const logRestaurantFeedbackClick = (platform) =>
  api.post("/restaurant/api/feedback/click", { platform });

export const fetchRestaurantFeedbackClickSummary = (token) =>
  api.get("/restaurant/admin/feedback/clicks/summary", authHeaders(token));
