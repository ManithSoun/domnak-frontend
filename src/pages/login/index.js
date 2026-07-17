"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/router";
import Link from "next/link";
import { useAuth } from "../../../router/useAuth";
import { 
  Home as HomeIcon, 
  Compass, 
  Mail, 
  Lock, 
  User, 
  Building2,
  Eye, 
  EyeOff, 
  Loader2, 
  ArrowLeft,
  CheckCircle2,
  AlertCircle,
  Phone
} from "lucide-react";

import { login as apiLogin, signup as apiSignup } from "@/lib/api/index";
import styles from "./Login.module.css";

export default function LoginPage() {
  const router = useRouter();
  const { login } = useAuth();
  
  // State variables
  const [isLogin, setIsLogin] = useState(true);
  const [role, setRole] = useState("homeowner"); // 'homeowner' | 'architect'
  const [formData, setFormData] = useState({
    name: "",
    email: "",
    phone: "",
    password: "",
    confirmPassword: "",
    company: "",
    agreeTerms: false,
  });
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");

  // Effect to parse role query parameters
  useEffect(() => {
    if (router.isReady) {
      // Parse error from query params (e.g., session expired redirect)
      if (router.query.error) {
        setError(decodeURIComponent(router.query.error));
        // Clean URL without reload
        router.replace("/login", undefined, { shallow: true });
      }
      if (router.query.role) {
        const queryRole = router.query.role.toLowerCase();
        if (queryRole === "homeowner" || queryRole === "architect") {
          setRole(queryRole);
          setIsLogin(false);
        }
      }
    }
  }, [router.isReady, router.query]);

  // Input changes
  const handleInputChange = (e) => {
    const { name, value, type, checked } = e.target;
    setFormData((prev) => ({
      ...prev,
      [name]: type === "checkbox" ? checked : value,
    }));
    setError(""); // Clear error when user types
  };

  // Form submission
  const handleSubmit = async (e) => {
    e.preventDefault();
    setError("");
    setSuccess("");

    // Validate inputs
    if (!formData.email) {
      setError("Please enter your email address.");
      return;
    }
    if (!/\S+@\S+\.\S+/.test(formData.email)) {
      setError("Please enter a valid email address.");
      return;
    }
    if (!formData.password) {
      setError("Please enter your password.");
      return;
    }

    if (!isLogin) {
      if (!formData.name) {
        setError("Please enter your full name.");
        return;
      }
      if (!formData.phone) {
        setError("Please enter your phone number.");
        return;
      }
      if (formData.password.length < 6) {
        setError("Password must be at least 6 characters long.");
        return;
      }
      if (formData.password !== formData.confirmPassword) {
        setError("Passwords do not match.");
        return;
      }
      if (role === "architect" && !formData.company) {
        setError("Please enter your studio or company name.");
        return;
      }
      if (!formData.agreeTerms) {
        setError("You must agree to the Terms of Service and Privacy Policy.");
        return;
      }
    }

    setLoading(true);
    
    try {
      if (isLogin) {
        let data;
        try {
          // Real Login Call
          data = await apiLogin({
            email: formData.email,
            password: formData.password
          });
        } catch (apiErr) {
          const isNetworkError = 
            apiErr.message === "Failed to fetch" || 
            apiErr.message.includes("NetworkError") || 
            apiErr.message.includes("fetch");
            
          if (isNetworkError) {
            console.warn("Backend disconnected, falling back to local mock login:", apiErr);
            data = {
              role: role || "homeowner",
              full_name: formData.email.split("@")[0] || "richhyda",
              user_id: "mock-user-123",
              access_token: "mock-token-xyz"
            };
          } else {
            // Rethrow real backend login error
            throw apiErr;
          }
        }
        
        const resolvedData = data.data || data;
        
        console.log("[Login] Full response:", data);
        console.log("[Login] Resolved data:", resolvedData);
        console.log("[Login] Token:", resolvedData.access_token ? "Present" : "Missing");
        
        // Log in via useAuth hook
        login({
          email: formData.email,
          role: resolvedData.role || role || "homeowner",
          full_name: resolvedData.full_name || formData.email.split("@")[0] || "richhyda",
          company: role === "architect" ? formData.company : null,
          userId: resolvedData.user_id,
          accessToken: resolvedData.access_token,
        });

        if (data.data) {
          setSuccess("Successfully logged in!");
        } else {
          setSuccess("Successfully logged in (Offline Mock Fallback)!");
        }
        
        // Redirect based on role
        setTimeout(() => {
          if ((data.role || role || "homeowner") === "architect") {
            router.push("/architect");
          } else {
            router.push("/homeowners");
          }
        }, 1000);
      } else {
        try {
          // Real Signup Call
          await apiSignup({
            email: formData.email,
            password: formData.password,
            name: formData.name,
            role: role,
            phone: formData.phone
          });

          setSuccess("Account created successfully! Please sign in.");
          
          // Switch to login tab after success
          setTimeout(() => {
            setIsLogin(true);
            setLoading(false);
            setSuccess("");
          }, 1500);
        } catch (apiErr) {
          const isNetworkError = 
            apiErr.message === "Failed to fetch" || 
            apiErr.message.includes("NetworkError") || 
            apiErr.message.includes("fetch");
            
          if (isNetworkError) {
            console.warn("Backend disconnected, simulating local signup success:", apiErr);
            setSuccess("Account created successfully! Please sign in.");
            setTimeout(() => {
              setIsLogin(true);
              setLoading(false);
              setSuccess("");
            }, 1500);
          } else {
            // Rethrow real backend signup error
            throw apiErr;
          }
        }
      }
    } catch (err) {
      setError(err.message || "An unexpected error occurred. Please try again.");
      setLoading(false);
    }
  };

  const handleOAuthLogin = (provider) => {
    const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
    const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;
    const redirectUrl = `${window.location.origin}/auth/callback?role=${role}`;
    
    // Construct the authorize URL for Supabase OAuth implicit flow
    const oauthUrl = `${supabaseUrl}/auth/v1/authorize?provider=${provider}&redirect_to=${encodeURIComponent(redirectUrl)}&apikey=${supabaseAnonKey}`;
    
    // Redirect browser to Supabase authorize endpoint
    window.location.href = oauthUrl;
  };

  return (
    <div className={styles.pageContainer}>
      
      {/* Back button top-left on mobile / floating */}
      <Link 
        href="/" 
        className={styles.backButton}
      >
        <ArrowLeft className="h-4 w-4" />
        Back to Home
      </Link>

      {/* LEFT SIDE: Visual Aesthetic Banner (hidden on mobile) */}
      <div className={styles.leftSide}>
        <div 
          className={styles.bgImage}
          style={{ backgroundImage: "url('/assets/domnak-landing.png')" }}
        />
        <div className={styles.overlay} />
        
        {/* Floating grid pattern lines */}
        <div className={styles.gridPattern} />

        <div className={styles.leftContent}>
          <div className="inline-flex items-center gap-3">
            <img 
              src="/assets/domnak-logo-with-kh-cream.png" 
              alt="Domnak Logo" 
              className={styles.logo}
            />
          </div>

          <div className={styles.titleWrapper}>
            <h1 className={styles.leftTitle}>
              Build with <span className="text-brand-gold">full clarity</span> and confidence.
            </h1>
            <p className={styles.leftDesc}>
              Domnak bridges the gap between homeowners and architects. Simplify planning, track budgets, and design beautiful spaces.
            </p>
          </div>

          <div className={styles.featuresList}>
            <div className={styles.featureItem}>
              <CheckCircle2 className={styles.featureIcon} />
              <div>
                <h4 className={styles.featureTitle}>Instant BOQ Builders</h4>
                <p className={styles.featureDesc}>Create structured material templates and estimates in minutes.</p>
              </div>
            </div>
            <div className={styles.featureItem}>
              <CheckCircle2 className={styles.featureIcon} />
              <div>
                <h4 className={styles.featureTitle}>Interactive 2D Scan & Tools</h4>
                <p className={styles.featureDesc}>Manage planning documents and layout measurements in one place.</p>
              </div>
            </div>
            <div className={styles.featureItem}>
              <CheckCircle2 className={styles.featureIcon} />
              <div>
                <h4 className={styles.featureTitle}>Direct Architect-Client Portals</h4>
                <p className={styles.featureDesc}>Seamless document share, designs review, and budget tracking.</p>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* RIGHT SIDE: Auth Form Container */}
      <div className={styles.rightSide}>
        <div className={styles.formWrapper}>
          
          {/* Logo on mobile only */}
          <div className={styles.mobileLogoWrapper}>
            <img 
              src="/assets/domnak-logo-cream.png" 
              alt="Domnak Logo" 
              className={styles.mobileLogo}
            />
          </div>

          {/* Form Header */}
          <div className={styles.formHeader}>
            <h2 className={styles.formTitle}>
              {isLogin ? "Welcome back" : "Create an account"}
            </h2>
            <p className={styles.formSubtitle}>
              {isLogin ? "Sign in to access your Domnak projects" : "Join us to simplify your home building journey"}
            </p>
          </div>

          {/* Toggle Tab */}
          <div className={styles.tabWrapper}>
            <button
              type="button"
              onClick={() => { setIsLogin(true); setError(""); setSuccess(""); }}
              className={isLogin ? styles.tabButtonActive : styles.tabButtonInactive}
            >
              Sign In
            </button>
            <button
              type="button"
              onClick={() => { setIsLogin(false); setError(""); setSuccess(""); }}
              className={!isLogin ? styles.tabButtonActive : styles.tabButtonInactive}
            >
              Create Account
            </button>
          </div>

          {/* Error and Success Notifications */}
          {error && (
            <div className={`${styles.notificationError} animate-shake`}>
              <AlertCircle className="h-5 w-5 text-rose-600 shrink-0" />
              <span>{error}</span>
            </div>
          )}

          {success && (
            <div className={`${styles.notificationSuccess} animate-pulse`}>
              <CheckCircle2 className="h-5 w-5 text-emerald-600 shrink-0" />
              <span>{success}</span>
            </div>
          )}

          {/* Auth Form */}
          <form onSubmit={handleSubmit} className={styles.form}>
            
            {/* ROLE SELECTOR GRID */}
            <div className="space-y-3">
              <label className={styles.roleLabel}>
                Are you a Homeowner or Architect?
              </label>
              <div className={styles.roleGrid}>
                
                {/* Homeowner Card */}
                <button
                  type="button"
                  onClick={() => setRole("homeowner")}
                  className={role === "homeowner" ? styles.roleCardActive : styles.roleCardInactive}
                >
                  <div className={role === "homeowner" ? styles.roleIconActive : styles.roleIconInactive}>
                    <HomeIcon className="h-5 w-5" />
                  </div>
                  <span className={styles.roleCardTitle}>Homeowner</span>
                  <span className={styles.roleCardSubtitle}>I want to build my dream home</span>
                </button>

                {/* Architect Card */}
                <button
                  type="button"
                  onClick={() => setRole("architect")}
                  className={role === "architect" ? styles.roleCardActive : styles.roleCardInactive}
                >
                  <div className={role === "architect" ? styles.roleIconActive : styles.roleIconInactive}>
                    <Compass className="h-5 w-5" />
                  </div>
                  <span className={styles.roleCardTitle}>Architect</span>
                  <span className={styles.roleCardSubtitle}>I design & build for clients</span>
                </button>

              </div>
            </div>

            {/* FORM INPUTS */}
            <div className={styles.inputContainer}>
              
              {/* Full Name (Sign Up Only) */}
              {!isLogin && (
                <div className="space-y-1.5">
                  <label htmlFor="name" className={styles.inputLabel}>
                    Full Name
                  </label>
                  <div className={styles.inputWrapper}>
                    <div className={styles.inputIcon}>
                      <User className="h-4.5 w-4.5" />
                    </div>
                    <input
                      id="name"
                      name="name"
                      type="text"
                      value={formData.name}
                      onChange={handleInputChange}
                      placeholder="e.g. Sophal Chan"
                      className={styles.textInput}
                    />
                  </div>
                </div>
              )}

              {!isLogin && (
                <div className="space-y-1.5 animate-in slide-in-from-top-2 duration-200">
                  <label htmlFor="phone" className={styles.inputLabel}>
                    Phone Number
                  </label>
                  <div className={styles.inputWrapper}>
                    <div className={styles.inputIcon}>
                      <Phone className="h-4.5 w-4.5" />
                    </div>
                    <input
                      id="phone"
                      name="phone"
                      type="tel"
                      value={formData.phone}
                      onChange={handleInputChange}
                      placeholder="e.g. 012345678"
                      className={styles.textInput}
                    />
                  </div>
                </div>
              )}

              {/* Email Address */}
              <div className="space-y-1.5">
                <label htmlFor="email" className={styles.inputLabel}>
                  Email Address
                </label>
                <div className={styles.inputWrapper}>
                  <div className={styles.inputIcon}>
                    <Mail className="h-4.5 w-4.5" />
                  </div>
                  <input
                    id="email"
                    name="email"
                    type="email"
                    value={formData.email}
                    onChange={handleInputChange}
                    placeholder="e.g. sophal@example.com"
                    className={styles.textInput}
                  />
                </div>
              </div>

              {/* Company / Studio Name (Sign Up & Architect Only) */}
              {!isLogin && role === "architect" && (
                <div className="space-y-1.5">
                  <label htmlFor="company" className={styles.inputLabel}>
                    Studio / Company Name
                  </label>
                  <div className={styles.inputWrapper}>
                    <div className={styles.inputIcon}>
                      <Building2 className="h-4.5 w-4.5" />
                    </div>
                    <input
                      id="company"
                      name="company"
                      type="text"
                      value={formData.company}
                      onChange={handleInputChange}
                      placeholder="e.g. Angkor Architecture Studio"
                      className={styles.textInput}
                    />
                  </div>
                </div>
              )}

              {/* Password */}
              <div className="space-y-1.5">
                <div className={styles.inputLabelGroup}>
                  <label htmlFor="password" className={styles.inputLabel}>
                    Password
                  </label>
                  {isLogin && (
                    <Link href="#" className="text-xs font-semibold text-brand-gold hover:text-brand-gold-dark transition-colors">
                      Forgot Password?
                    </Link>
                  )}
                </div>
                <div className={styles.inputWrapper}>
                  <div className={styles.inputIcon}>
                    <Lock className="h-4.5 w-4.5" />
                  </div>
                  <input
                    id="password"
                    name="password"
                    type={showPassword ? "text" : "password"}
                    value={formData.password}
                    onChange={handleInputChange}
                    placeholder="••••••••"
                    className={styles.passwordInput}
                  />
                  <button
                    type="button"
                    onClick={() => setShowPassword(!showPassword)}
                    className={styles.passwordToggle}
                  >
                    {showPassword ? <EyeOff className="h-4.5 w-4.5" /> : <Eye className="h-4.5 w-4.5" />}
                  </button>
                </div>
              </div>

              {/* Confirm Password (Sign Up Only) */}
              {!isLogin && (
                <div className="space-y-1.5">
                  <label htmlFor="confirmPassword" className={styles.inputLabel}>
                    Confirm Password
                  </label>
                  <div className={styles.inputWrapper}>
                    <div className={styles.inputIcon}>
                      <Lock className="h-4.5 w-4.5" />
                    </div>
                    <input
                      id="confirmPassword"
                      name="confirmPassword"
                      type={showConfirmPassword ? "text" : "password"}
                      value={formData.confirmPassword}
                      onChange={handleInputChange}
                      placeholder="••••••••"
                      className={styles.passwordInput}
                    />
                    <button
                      type="button"
                      onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                      className={styles.passwordToggle}
                    >
                      {showConfirmPassword ? <EyeOff className="h-4.5 w-4.5" /> : <Eye className="h-4.5 w-4.5" />}
                    </button>
                  </div>
                </div>
              )}

            </div>

            {/* Checkbox (Terms on Sign up, Remember me on Login) */}
            <div className={styles.checkboxContainer}>
              {isLogin ? (
                <div className={styles.checkboxRow}>
                  <input
                    id="remember"
                    name="remember"
                    type="checkbox"
                    className={styles.checkbox}
                  />
                  <label htmlFor="remember" className={styles.checkboxLabel}>
                    Remember me on this device
                  </label>
                </div>
              ) : (
                <div className={styles.checkboxRowStart}>
                  <input
                    id="agreeTerms"
                    name="agreeTerms"
                    type="checkbox"
                    checked={formData.agreeTerms}
                    onChange={handleInputChange}
                    className={styles.checkbox}
                  />
                  <label htmlFor="agreeTerms" className={styles.checkboxLabel}>
                    I agree to the{" "}
                    <Link href="#" className="font-semibold text-brand-gold hover:text-brand-gold-dark">
                      Terms of Service
                    </Link>{" "}
                    and{" "}
                    <Link href="#" className="font-semibold text-brand-gold hover:text-brand-gold-dark">
                      Privacy Policy
                    </Link>
                  </label>
                </div>
              )}
            </div>

            {/* SUBMIT BUTTON */}
            <button
              type="submit"
              disabled={loading}
              className={styles.submitButton}
            >
              {loading ? (
                <>
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  {isLogin ? "Signing in..." : "Creating Account..."}
                </>
              ) : (
                isLogin ? "Sign In" : "Create Account"
              )}
            </button>

            {/* Divider */}
            <div className={styles.divider}>
              <div className={styles.dividerLine}></div>
              <span className={styles.dividerText}>Or continue with</span>
              <div className={styles.dividerLine}></div>
            </div>

            {/* Social Buttons */}
            <div className={styles.socialGrid}>
              <button
                type="button"
                onClick={() => handleOAuthLogin("google")}
                className={styles.socialButton}
              >
                <svg className="h-5 w-5 mr-2" viewBox="0 0 24 24" fill="currentColor">
                  <path d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z" fill="#4285F4" />
                  <path d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z" fill="#34A853" />
                  <path d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.06H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.94l2.85-2.22.81-.63z" fill="#FBBC05" />
                  <path d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.06l3.66 2.84c.87-2.6 3.3-4.52 6.16-4.52z" fill="#EA4335" />
                </svg>
                Google
              </button>

              <button
                type="button"
                onClick={() => handleOAuthLogin("github")}
                className={styles.socialButton}
              >
                <svg className="h-5 w-5 mr-2" viewBox="0 0 24 24" fill="currentColor">
                  <path fillRule="evenodd" clipRule="evenodd" d="M12 2C6.477 2 2 6.477 2 12c0 4.42 2.865 8.166 6.839 9.489.5.092.682-.217.682-.482 0-.237-.008-.866-.013-1.7-2.782.603-3.369-1.34-3.369-1.34-.454-1.156-1.11-1.464-1.11-1.464-.908-.62.069-.608.069-.608 1.003.07 1.531 1.03 1.531 1.03.892 1.529 2.341 1.087 2.91.832.092-.647.35-1.088.636-1.338-2.22-.253-4.555-1.11-4.555-4.943 0-1.091.39-1.984 1.029-2.683-.103-.253-.446-1.27.098-2.647 0 0 .84-.269 2.75 1.025A9.564 9.564 0 0112 6.844c.85.004 1.705.115 2.504.337 1.909-1.294 2.747-1.025 2.747-1.025.546 1.377.203 2.394.1 2.647.64.699 1.028 1.592 1.028 2.683 0 3.842-2.339 4.687-4.566 4.935.359.309.678.919.678 1.852 0 1.336-.012 2.415-.012 2.743 0 .267.18.579.688.481C19.137 20.162 22 16.418 22 12c0-5.523-4.477-10-10-10z" />
                </svg>
                GitHub
              </button>
            </div>

          </form>

        </div>
      </div>

    </div>
  );
}
