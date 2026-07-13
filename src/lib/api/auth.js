import { apiFetch } from "./client";

// POST /api/auth/signup
export async function signup({ email, password, name, role, phone }) {
  return apiFetch("/api/auth/signup", {
    method: "POST",
    body: JSON.stringify({
      email,
      password,
      full_name: name,
      phone_number: phone || "",
      role,
    }),
  });
}

// POST /api/auth/login
export async function login({ email, password }) {
  const data = await apiFetch("/api/auth/login", {
    method: "POST",
    body: JSON.stringify({ email, password }),
  });

  // Save token for subsequent requests
  if (typeof window !== "undefined" && data) {
    const payload = data.data || data;
    localStorage.setItem("access_token", payload.access_token);
    localStorage.setItem("user_id", payload.user_id);
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
