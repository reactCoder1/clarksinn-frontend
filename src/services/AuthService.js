import axios from "axios";
import Swal from "sweetalert2";
import { loginConfirmedAction, Logout } from "../store/actions/AuthActions";

const api = axios.create({
  baseURL: process.env.REACT_APP_API_URL || "http://localhost:4000",
  headers: {
    "Content-Type": "application/json",
  },
});

export function signUp(email, password) {
  return api.post("/admin/signup", { email, password });
}

export function login(email, password) {
  return api.post("/admin/login", { email, password });
}

export function formatError(errorResponse) {
  if (!errorResponse) {
    Swal.fire({
      icon: "error",
      title: "Oops",
      text: "An unknown error occurred.",
    });
    return "An unknown error occurred.";
  }

  if (typeof errorResponse === "string") {
    Swal.fire({
      icon: "error",
      title: "Oops",
      text: errorResponse,
    });
    return errorResponse;
  }

  const message =
    errorResponse.message ||
    errorResponse.error?.message ||
    errorResponse.error?.errors?.[0]?.message ||
    "Authentication failed.";

  Swal.fire({
    icon: "error",
    title: "Oops",
    text: message,
  });

  return message;
}

export function saveTokenInLocalStorage(tokenDetails) {
  if (tokenDetails.token && !tokenDetails.idToken) {
    tokenDetails.idToken = tokenDetails.token;
  }
  tokenDetails.expireDate = new Date(
    new Date().getTime() + Number(tokenDetails.expiresIn) * 1000,
  );
  localStorage.setItem("userDetails", JSON.stringify(tokenDetails));
}

export function runLogoutTimer(dispatch, timer, navigate) {
  setTimeout(() => {
    dispatch(Logout(navigate));
  }, timer);
}

export function checkAutoLogin(dispatch, navigate) {
  const tokenDetailsString = localStorage.getItem("userDetails");
  if (!tokenDetailsString) {
    dispatch(Logout(navigate));
    return;
  }

  const tokenDetails = JSON.parse(tokenDetailsString);
  const expireDate = new Date(tokenDetails.expireDate);
  const todaysDate = new Date();

  if (todaysDate > expireDate) {
    dispatch(Logout(navigate));
    return;
  }

  dispatch(loginConfirmedAction(tokenDetails));

  const timer = expireDate.getTime() - todaysDate.getTime();
  runLogoutTimer(dispatch, timer, navigate);
}
