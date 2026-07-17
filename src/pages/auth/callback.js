import { useEffect, useState } from "react";
import { useRouter } from "next/router";
import { useAuth } from "../../../router/useAuth";
import Head from "next/head";
import { Loader2, ShieldCheck, AlertCircle } from "lucide-react";

export default function AuthCallbackPage() {
  const router = useRouter();
  const { login } = useAuth();
  const [status, setStatus] = useState("initializing"); // "initializing" | "verifying" | "syncing" | "success" | "error"
  const [errorMsg, setErrorMsg] = useState("");

  useEffect(() => {
    if (!router.isReady) return;

    const handleCallback = async () => {
      try {
        // 1. Get tokens from hash fragment
        const hash = window.location.hash.substring(1);
        if (!hash) {
          throw new Error("No authorization code or tokens found in URL.");
        }

        const params = new URLSearchParams(hash);
        const accessToken = params.get("access_token");
        const refreshToken = params.get("refresh_token");

        if (!accessToken) {
          throw new Error("Authentication failed: Access token missing.");
        }

        setStatus("verifying");

        const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
        const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;

        // 2. Fetch User Profile from Supabase Auth API
        const userRes = await fetch(`${supabaseUrl}/auth/v1/user`, {
          method: "GET",
          headers: {
            Authorization: `Bearer ${accessToken}`,
            apikey: supabaseAnonKey,
          },
        });

        if (!userRes.ok) {
          throw new Error("Failed to verify credentials with auth provider.");
        }

        const userData = await userRes.json();
        const userId = userData.id;
        const email = userData.email;
        const name = userData.user_metadata?.full_name || email.split("@")[0];

        // 3. Resolve role (from query parameters, default to homeowner)
        const role = (router.query.role || "homeowner").toLowerCase();

        setStatus("syncing");

        // 4. Update role inside Supabase Auth user metadata
        await fetch(`${supabaseUrl}/auth/v1/user`, {
          method: "PUT",
          headers: {
            Authorization: `Bearer ${accessToken}`,
            apikey: supabaseAnonKey,
            "Content-Type": "application/json",
          },
          body: JSON.stringify({
            data: {
              role: role,
            },
          }),
        });

        // 5. Ensure user profile exists in public.users table via direct Supabase REST API
        // This acts as a robust fallback/upsert if there's no auto-sync trigger on the DB
        try {
          await fetch(`${supabaseUrl}/rest/v1/users`, {
            method: "POST",
            headers: {
              Authorization: `Bearer ${accessToken}`,
              apikey: supabaseAnonKey,
              "Content-Type": "application/json",
              Prefer: "resolution=merge-duplicates",
            },
            body: JSON.stringify({
              id: userId,
              full_name: name,
              phone_number: "",
              location: null,
            }),
          });
        } catch (dbErr) {
          console.warn("Direct DB sync warning:", dbErr);
          // Don't throw here as the trigger might still work
        }

        // 6. Save backend token credentials
        localStorage.setItem("access_token", accessToken);
        localStorage.setItem("user_id", userId);
        if (refreshToken) {
          localStorage.setItem("refresh_token", refreshToken);
        }

        // 7. Initialize user session in useAuth hook
        login({
          email: email,
          role: role,
          name: name,
          userId: userId,
          accessToken: accessToken,
        });

        setStatus("success");

        // 8. Redirect based on role
        setTimeout(() => {
          if (role === "architect") {
            router.push("/architect");
          } else {
            router.push("/homeowners");
          }
        }, 1200);

      } catch (err) {
        console.error("Auth callback error:", err);
        setStatus("error");
        setErrorMsg(err.message || "An unexpected error occurred during login.");
      }
    };

    handleCallback();
  }, [router.isReady, router.query]);

  return (
    <div className="min-h-screen bg-brand-dark flex flex-col items-center justify-center relative overflow-hidden px-6 py-12">
      <Head>
        <title>Connecting to Domnak...</title>
      </Head>

      {/* Ambient background blur circles for high aesthetic value */}
      <div className="absolute -top-40 -left-40 w-96 h-96 rounded-full bg-brand-gold/10 blur-3xl pointer-events-none" />
      <div className="absolute -bottom-40 -right-40 w-96 h-96 rounded-full bg-brand-gold/5 blur-3xl pointer-events-none" />

      {/* Main glassmorphism card */}
      <div className="w-full max-w-md bg-white/5 border border-white/10 backdrop-blur-xl p-8 rounded-3xl shadow-2xl flex flex-col items-center text-center space-y-8 relative z-10 transition-all duration-300">
        
        {/* Brand logo */}
        <img 
          src="/assets/domnak-logo-with-kh-cream.png" 
          alt="Domnak Logo" 
          className="h-14 w-auto object-contain brightness-110 mb-2"
        />

        {/* Dynamic Status Icon */}
        <div className="relative flex items-center justify-center">
          {status !== "success" && status !== "error" && (
            <div className="relative">
              <div className="w-20 h-20 rounded-full border-2 border-brand-gold/20 animate-pulse" />
              <Loader2 className="absolute inset-0 m-auto h-10 w-10 text-brand-gold animate-spin" />
            </div>
          )}

          {status === "success" && (
            <div className="w-20 h-20 rounded-full bg-emerald-500/10 border border-emerald-500/30 flex items-center justify-center animate-bounce text-emerald-400">
              <ShieldCheck className="h-10 w-10" />
            </div>
          )}

          {status === "error" && (
            <div className="w-20 h-20 rounded-full bg-rose-500/10 border border-rose-500/30 flex items-center justify-center text-rose-400">
              <AlertCircle className="h-10 w-10" />
            </div>
          )}
        </div>

        {/* Dynamic Status Message */}
        <div className="space-y-3">
          <h3 className="text-xl font-bold text-white tracking-wide">
            {status === "initializing" && "Initializing Connection"}
            {status === "verifying" && "Verifying Credentials"}
            {status === "syncing" && "Syncing User Profile"}
            {status === "success" && "Authentication Successful!"}
            {status === "error" && "Sign In Failed"}
          </h3>
          
          <p className="text-sm text-white/60 max-w-xs leading-relaxed">
            {status === "initializing" && "Establishing connection with secure identity servers..."}
            {status === "verifying" && "Authenticating token signature and validating account safety..."}
            {status === "syncing" && "Configuring your user dashboard preferences..."}
            {status === "success" && "Redirecting to your workspace. Get ready to build!"}
            {status === "error" && (errorMsg || "Could not complete authorization. Please try again.")}
          </p>
        </div>

        {/* Error back CTA */}
        {status === "error" && (
          <button
            onClick={() => router.push("/login")}
            className="w-full py-3 px-4 rounded-xl bg-brand-gold text-sm font-bold text-white hover:bg-brand-gold-dark transition-colors duration-200"
          >
            Go Back to Login
          </button>
        )}
      </div>
    </div>
  );
}
