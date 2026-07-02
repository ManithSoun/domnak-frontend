import { useState, useEffect } from "react";
import { useRouter } from "next/router";
import { ROUTES } from "./routes";

export function RouteGuard({ children }) {
  const router = useRouter();
  const [authorized, setAuthorized] = useState(false);

  useEffect(() => {
    // Initial verification 
    authCheck(router.asPath);

    // Event listener callbacks for routing
    const hideContent = () => setAuthorized(false);
    router.events.on("routeChangeStart", hideContent);
    router.events.on("routeChangeComplete", authCheck);

    return () => {
      router.events.off("routeChangeStart", hideContent);
      router.events.off("routeChangeComplete", authCheck);
    };
  }, [router.asPath, router.isReady]);

  function authCheck(url) {
    // Extract base pathname without queries or hashes
    const path = url.split("?")[0].split("#")[0];

    // Define public routes
    const publicPaths = [
      ROUTES.HOME,
      ROUTES.LOGIN,
      ROUTES.CHATBOT,
      ROUTES.SUPPLIER
    ];

    let session = null;
    if (typeof window !== "undefined") {
      const sessionStr = localStorage.getItem("domnak_session");
      if (sessionStr) {
        try {
          session = JSON.parse(sessionStr);
        } catch (e) {
          console.error("RouteGuard: session parse error", e);
        }
      }
    }

    const isPublicPath = publicPaths.includes(path) || path === "";

    if (!session) {
      if (!isPublicPath) {
        // Unauthenticated user trying to access private page -> Redirect to login page
        setAuthorized(false);
        router.push({
          pathname: ROUTES.LOGIN,
          query: { returnUrl: router.asPath }
        });
      } else {
        // Unauthenticated user accessing public page -> OK
        setAuthorized(true);
      }
    } else {
      // Authenticated user
      if (path === ROUTES.LOGIN) {
        // Logged in user visiting login page -> Redirect to dashboard
        setAuthorized(false);
        router.push(session.role === "architect" ? ROUTES.ARCHITECT : ROUTES.HOMEOWNERS);
      } else if (path.startsWith(ROUTES.ARCHITECT) && session.role !== "architect") {
        // Prevent non-architect user from accessing architect pages
        setAuthorized(false);
        router.push(ROUTES.HOMEOWNERS);
      } else if (path.startsWith(ROUTES.HOMEOWNERS) && session.role !== "homeowner") {
        // Prevent non-homeowner user from accessing homeowner pages
        setAuthorized(false);
        router.push(ROUTES.ARCHITECT);
      } else {
        // Right role or public page -> OK
        setAuthorized(true);
      }
    }
  }

  // Render children only when page is authorized
  return authorized ? <>{children}</> : null;
}
