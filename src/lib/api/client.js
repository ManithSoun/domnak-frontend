const API_URL = process.env.NEXT_PUBLIC_API_URL;

// Validate JWT format - JWT should have 3 base64url-encoded parts
function isValidJWTFormat(token) {
  if (!token || typeof token !== "string") return false;
  const parts = token.split(".");
  if (parts.length !== 3) return false;
  // Check each part is non-empty and looks like base64url
  const base64urlRegex = /^[A-Za-z0-9_-]+$/;
  return parts.every(p => p.length > 0 && base64urlRegex.test(p));
}

// Get token from localStorage (set by login)
function getToken() {
  if (typeof window === "undefined") return null;
  const token = localStorage.getItem("access_token");
  
  // Validate token format
  if (token && !isValidJWTFormat(token)) {
    console.error("[apiFetch] Token is malformed, clearing it:", token?.substring(0, 50));
    localStorage.removeItem("access_token");
    localStorage.removeItem("refresh_token");
    localStorage.removeItem("user_id");
    if (typeof window !== "undefined") {
      window.dispatchEvent(new Event("domnak_login"));
    }
    return null;
  }
  
  if (!token || token === "mock-token-xyz" || token === "undefined" || token === "null") {
    return null;
  }
  return token;
}

// Refresh the access token using refresh token
async function refreshAccessToken() {
  const refreshToken = localStorage.getItem("refresh_token");
  if (!refreshToken) {
    console.log("[refreshToken] No refresh token available");
    return null;
  }

  const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
  const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;

  try {
    console.log("[refreshToken] Attempting to refresh access token...");
    const res = await fetch(`${supabaseUrl}/auth/v1/token?grant_type=refresh_token`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        apikey: supabaseAnonKey,
      },
      body: JSON.stringify({
        refresh_token: refreshToken,
      }),
    });

    if (!res.ok) {
      console.log("[refreshToken] Refresh failed with status:", res.status);
      return null;
    }

    const data = await res.json();
    console.log("[refreshToken] Success! Got new access token");

    // Store the new tokens
    if (data.access_token) {
      localStorage.setItem("access_token", data.access_token);
    }
    if (data.refresh_token) {
      localStorage.setItem("refresh_token", data.refresh_token);
    }

    return data.access_token;
  } catch (err) {
    console.error("[refreshToken] Error:", err);
    return null;
  }
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
  console.log("[apiFetch] Called with:", { endpoint, hasBody: !!options.body, method: options.method });
  const token = getToken();
  console.log("[apiFetch] Token:", token ? `${token.slice(0, 20)}...` : "null");
  const headers = {
    "Content-Type": "application/json",
    ...(token && { Authorization: `Bearer ${token}` }),
    ...options.headers,
  };

  console.log("[apiFetch] Full URL:", `${API_URL}${endpoint}`);
  const res = await fetch(`${API_URL}${endpoint}`, {
    ...options,
    headers,
  });
  console.log("[apiFetch] Response status:", res.status);

  if (!res.ok) {
    let error;
    try {
      error = await res.json();
    } catch {
      error = { detail: res.statusText };
    }
    console.log("[apiFetch] Error response:", JSON.stringify(error));
    
    // Check for malformed JWT error from Supabase
    const errorText = JSON.stringify(error);
    if (res.status === 401 && (
      errorText.includes("invalid JWT") || 
      errorText.includes("malformed") ||
      errorText.includes("invalid number of segments") ||
      errorText.includes("Invalid JWT") ||
      errorText.includes("token contains")
    )) {
      console.error("[apiFetch] JWT validation failed, clearing tokens and redirecting to login");
      if (typeof window !== "undefined") {
        localStorage.removeItem("access_token");
        localStorage.removeItem("refresh_token");
        localStorage.removeItem("user_id");
        localStorage.removeItem("domnak_session");
        window.dispatchEvent(new Event("domnak_login"));
        window.location.href = "/login?error=Session invalid. Please log in again.";
        return;
      }
    }
    
    // Try to refresh the token first
    console.log("[apiFetch] Got 401, attempting token refresh...");
    const newToken = await refreshAccessToken();
    
    if (newToken) {
      // Retry the original request with new token
      console.log("[apiFetch] Token refreshed, retrying request...");
      const retryRes = await fetch(`${API_URL}${endpoint}`, {
        ...options,
        headers: {
          ...options.headers,
          "Content-Type": "application/json",
          Authorization: `Bearer ${newToken}`,
        },
      });
      
      if (retryRes.ok) {
        return retryRes.json();
      }
      // If retry also fails, proceed to logout
      console.log("[apiFetch] Retry failed with status:", retryRes.status);
    }
    
    // Either refresh failed or retry failed - logout
    if (typeof window !== "undefined") {
      localStorage.removeItem("access_token");
      localStorage.removeItem("refresh_token");
      localStorage.removeItem("user_id");
      localStorage.removeItem("domnak_session");
      window.dispatchEvent(new Event("domnak_login"));
      window.location.href = "/login?error=Session expired. Please log in again.";
      return;
    }
    
    const errorMsg = getFriendlyErrorMessage(
      error.detail || 
      error?.error?.message ||
      error?.error?.detail
    );
    throw new Error(errorMsg);
  }

  return res.json();
}

export { apiFetch, getToken, getAuthHeaders };

// Helper to get auth headers for direct fetch calls
function getAuthHeaders() {
  const token = getToken();
  return token ? { Authorization: `Bearer ${token}` } : {};
}
