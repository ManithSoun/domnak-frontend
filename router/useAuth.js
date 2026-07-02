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
            setUser(JSON.parse(sessionStr));
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
    setUser(sessionData);
    // Dispatch custom event to trigger updates inside same-tab components
    window.dispatchEvent(new Event("domnak_login"));
  };

  const logout = () => {
    localStorage.removeItem("domnak_session");
    setUser(null);
    window.dispatchEvent(new Event("domnak_login"));
    router.push(ROUTES.LOGIN);
  };

  return { user, loading, login, logout };
}
