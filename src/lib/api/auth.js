import { apiFetch } from "./client";

// POST /api/auth/signup
export async function signup({ email, password, name, role, phone }) {
  return apiFetch("/api/auth/signup", {
    method: "POST",
    body: JSON.stringify({ email, password, name, role, phone }),
  });
}

// POST /api/auth/login
export async function login({ email, password }) {
  const data = await apiFetch("/api/auth/login", {
    method: "POST",
    body: JSON.stringify({ email, password }),
  });

  // Save token for subsequent requests
  if (typeof window !== "undefined") {
    localStorage.setItem("access_token", data.access_token);
    localStorage.setItem("user_id", data.user_id);
  }

  return data;
}

// GET /api/auth/me
export async function getMe(userId) {
  return apiFetch(`/api/auth/me?user_id=${userId}`);
}

// Logout — clear stored token
export function logout() {
  if (typeof window !== "undefined") {
    localStorage.removeItem("access_token");
    localStorage.removeItem("user_id");
  }
}
