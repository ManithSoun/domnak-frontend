const API_URL = process.env.NEXT_PUBLIC_API_URL;

// Get token from localStorage (set by login)
function getToken() {
  if (typeof window === "undefined") return null;
  const token = localStorage.getItem("access_token");
  if (!token || token === "mock-token-xyz" || token === "undefined" || token === "null") return null;
  return token;
}

function getFriendlyErrorMessage(detail) {
  if (!detail) return "API request failed";
  
  const errorStr = typeof detail === "object" ? JSON.stringify(detail) : String(detail);
  
  // 1. Check for duplicate key / unique constraint errors (code 23505)
  if (
    errorStr.includes("23505") || 
    errorStr.includes("duplicate key") || 
    errorStr.includes("already registered") || 
    errorStr.includes("profiles_pkey")
  ) {
    return "This email address is already registered. Please try logging in or use a different email.";
  }
  
  // 2. Check for weak password
  if (errorStr.includes("weak_password") || errorStr.includes("Password should be")) {
    return "Password is too weak. Please use a stronger password (at least 6 characters).";
  }
  
  // 3. Check for validation / phone format errors
  if (errorStr.includes("Phone number format is invalid") || errorStr.includes("validate_phone")) {
    return "Invalid phone number format. Please enter a valid Cambodian phone number (e.g., 012345678).";
  }
  
  // 4. FastAPI list of errors (e.g. [{msg: "...", ...}])
  if (Array.isArray(detail) && detail.length > 0) {
    return detail.map(err => err.msg || JSON.stringify(err)).join(", ");
  }
  
  // 5. Dictionary error format (e.g. {message: "..."})
  if (typeof detail === "object") {
    if (detail.message) return detail.message;
    if (detail.msg) return detail.msg;
    return JSON.stringify(detail);
  }
  
  return String(detail);
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
    
    if (res.status === 401) {
      if (typeof window !== "undefined") {
        localStorage.removeItem("access_token");
        localStorage.removeItem("user_id");
        localStorage.removeItem("domnak_session");
        window.dispatchEvent(new Event("domnak_login"));
        window.location.href = "/login?error=Session expired. Please log in again.";
        return;
      }
    }
    
    const errorMsg = getFriendlyErrorMessage(error.detail);
    throw new Error(errorMsg);
  }

  return res.json();
}

export { apiFetch, getToken };
