const API_URL = process.env.NEXT_PUBLIC_API_URL;

// Get token from localStorage (set by login)
function getToken() {
  if (typeof window === "undefined") return null;
  return localStorage.getItem("access_token");
}

// Base fetch with auth header
async function apiFetch(endpoint, options = {}) {
  const token = getToken();
  const headers = {
    "Content-Type": "application/json",
    ...(token && { Authorization: `Bearer ${token}` }),
    ...options.headers,
  };

  const res = await fetch(`${API_URL}${endpoint}`, {
    ...options,
    headers,
  });

  if (!res.ok) {
    const error = await res.json().catch(() => ({ detail: res.statusText }));
    throw new Error(error.detail || "API request failed");
  }

  return res.json();
}

export { apiFetch, getToken };
