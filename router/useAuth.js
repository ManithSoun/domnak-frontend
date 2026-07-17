import { useState, useEffect } from "react";
import { useRouter } from "next/router";
import { ROUTES } from "./routes";

export function useAuth() {
  const router = useRouter();
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    // Function to load session details
    const loadSession = () => {
      if (typeof window !== "undefined") {
        const sessionStr = localStorage.getItem("domnak_session");
        if (sessionStr) {
          try {
            const session = JSON.parse(sessionStr);
            setUser(session);
            // Sync access_token for apiFetch
            if (session.accessToken) {
              localStorage.setItem("access_token", session.accessToken);
            }
            if (session.userId) {
              localStorage.setItem("user_id", session.userId);
            }
          } catch (e) {
            console.error("Failed to parse domnak session", e);
          }
        } else {
          setUser(null);
        }
      }
      setLoading(false);
    };

    // Load session initially
    loadSession();

    // Listen for custom login/logout events or localstorage updates in other tabs
    window.addEventListener("storage", loadSession);
    window.addEventListener("domnak_login", loadSession);

    return () => {
      window.removeEventListener("storage", loadSession);
      window.removeEventListener("domnak_login", loadSession);
    };
  }, []);

  const login = (sessionData) => {
    localStorage.setItem("domnak_session", JSON.stringify(sessionData));
    // Also store access_token directly for apiFetch
    if (sessionData.accessToken) {
      localStorage.setItem("access_token", sessionData.accessToken);
    }
    if (sessionData.userId) {
      localStorage.setItem("user_id", sessionData.userId);
    }
    if (sessionData.refreshToken) {
      localStorage.setItem("refresh_token", sessionData.refreshToken);
    }
    setUser(sessionData);
    // Dispatch custom event to trigger updates inside same-tab components
    window.dispatchEvent(new Event("domnak_login"));
  };

  const logout = () => {
    localStorage.removeItem("domnak_session");
    localStorage.removeItem("access_token");
    localStorage.removeItem("refresh_token");
    localStorage.removeItem("user_id");
    setUser(null);
    window.dispatchEvent(new Event("domnak_login"));
    router.push(ROUTES.LOGIN);
  };

  return { user, loading, login, logout };
}
