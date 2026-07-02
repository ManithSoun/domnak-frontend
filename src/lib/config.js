export const API_URL = process.env.NEXT_PUBLIC_API_URL || "http://localhost:8000"

export const authHeaders = (token) => ({
  "Content-Type": "application/json",
  "authorization": `Bearer ${token}`
})

export const getToken = () => localStorage.getItem("token")
export const getUserId = () => localStorage.getItem("user_id")
export const getRole = () => localStorage.getItem("role")

export const saveAuth = (data) => {
  localStorage.setItem("token", data.access_token)
  localStorage.setItem("user_id", data.user_id)
  localStorage.setItem("role", data.role)
  localStorage.setItem("full_name", data.full_name)
}

export const clearAuth = () => {
  localStorage.removeItem("token")
  localStorage.removeItem("user_id")
  localStorage.removeItem("role")
  localStorage.removeItem("full_name")
}

export const isLoggedIn = () => !!localStorage.getItem("token")