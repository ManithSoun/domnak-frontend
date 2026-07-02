import { API_URL, authHeaders, saveAuth } from "../config"

export async function signup(full_name, email, password, role, phone_number) {
  const res = await fetch(`${API_URL}/api/v1/auth/signup`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ full_name, email, password, role, phone_number })
  })
  return res.json()
}

export async function login(email, password) {
  const res = await fetch(`${API_URL}/api/v1/auth/login`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ email, password })
  })
  const data = await res.json()
  if (data.data) {
    saveAuth(data.data)
  }
  return data
}

export async function getMe(token, user_id) {
  const res = await fetch(`${API_URL}/api/v1/auth/me?user_id=${user_id}`, {
    headers: authHeaders(token)
  })
  return res.json()
}

export async function logout() {
  clearAuth()
}