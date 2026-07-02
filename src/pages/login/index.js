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
  AlertCircle
} from "lucide-react";

export default function LoginPage() {
  const router = useRouter();
  const { login } = useAuth();
  
  // State variables
  const [isLogin, setIsLogin] = useState(true);
  const [role, setRole] = useState("homeowner"); // 'homeowner' | 'architect'
  const [formData, setFormData] = useState({
    name: "",
    email: "",
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
    if (router.isReady && router.query.role) {
      const queryRole = router.query.role.toLowerCase();
      if (queryRole === "homeowner" || queryRole === "architect") {
        setRole(queryRole);
        setIsLogin(false); // Default to Create Account (Sign Up) 
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

    // Process simulation
    setLoading(true);
    
    try {
      // Simulate API latency
      await new Promise((resolve) => setTimeout(resolve, 1500));
      
      // Log in via useAuth hook
      login({
        email: formData.email,
        role: role,
        name: isLogin ? (formData.email.split("@")[0]) : formData.name,
        company: role === "architect" ? formData.company : null,
      });

      setSuccess(isLogin ? "Successfully logged in!" : "Account created successfully!");
      
      // Redirect based on role
      setTimeout(() => {
        if (role === "architect") {
          router.push("/architect");
        } else {
          router.push("/homeowners");
        }
      }, 1000);

    } catch (err) {
      setError("An unexpected error occurred. Please try again.");
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-brand-cream flex flex-col md:flex-row relative">
      
      {/* Back button top-left on mobile / floating */}
      <Link 
        href="/" 
        className="absolute top-6 left-6 z-50 flex items-center gap-2 text-sm font-semibold text-brand-dark/80 hover:text-brand-gold bg-white/80 md:bg-white/90 backdrop-blur px-4 py-2 rounded-full border border-brand-dark/5 transition-all shadow-sm hover:shadow"
      >
        <ArrowLeft className="h-4 w-4" />
        Back to Home
      </Link>

      {/* LEFT SIDE: Visual Aesthetic Banner (hidden on mobile) */}
      <div className="hidden md:flex md:w-1/2 lg:w-3/5 bg-brand-dark relative items-center justify-center overflow-hidden p-12">
        <div 
          className="absolute inset-0 bg-cover bg-center bg-no-repeat scale-102 transition-transform duration-10000 ease-out"
          style={{ backgroundImage: "url('/assets/domnak-landing.png')" }}
        />
        <div className="absolute inset-0 bg-gradient-to-tr from-brand-dark/95 via-brand-dark/85 to-brand-dark/30" />
        
        {/* Floating grid pattern lines */}
        <div className="absolute inset-0 opacity-5 pointer-events-none bg-[radial-gradient(#b38e42_1.5px,transparent_1.5px)] [background-size:32px_32px]" />

        <div className="relative z-10 max-w-lg text-white space-y-8">
          <div className="inline-flex items-center gap-3">
            <img 
              src="/assets/domnak-logo-with-kh-cream.png" 
              alt="Domnak Logo" 
              className="h-16 w-auto object-contain"
            />
          </div>

          <div className="space-y-4">
            <h1 className="text-4xl lg:text-5xl font-extrabold leading-tight tracking-tight">
              Build with <span className="text-brand-gold">full clarity</span> and confidence.
            </h1>
            <p className="text-white/80 leading-relaxed">
              Domnak bridges the gap between homeowners and architects. Simplify planning, track budgets, and design beautiful spaces.
            </p>
          </div>

          <div className="pt-6 border-t border-white/10 space-y-4">
            <div className="flex items-start gap-3">
              <CheckCircle2 className="h-5 w-5 text-brand-gold shrink-0 mt-0.5" />
              <div>
                <h4 className="font-bold text-white">Instant BOQ Builders</h4>
                <p className="text-xs text-white/70">Create structured material templates and estimates in minutes.</p>
              </div>
            </div>
            <div className="flex items-start gap-3">
              <CheckCircle2 className="h-5 w-5 text-brand-gold shrink-0 mt-0.5" />
              <div>
                <h4 className="font-bold text-white">Interactive 2D Scan & Tools</h4>
                <p className="text-xs text-white/70">Manage planning documents and layout measurements in one place.</p>
              </div>
            </div>
            <div className="flex items-start gap-3">
              <CheckCircle2 className="h-5 w-5 text-brand-gold shrink-0 mt-0.5" />
              <div>
                <h4 className="font-bold text-white">Direct Architect-Client Portals</h4>
                <p className="text-xs text-white/70">Seamless document share, designs review, and budget tracking.</p>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* RIGHT SIDE: Auth Form Container */}
      <div className="w-full md:w-1/2 lg:w-2/5 flex flex-col justify-center px-6 py-12 sm:px-12 lg:px-16 bg-brand-cream relative z-10 overflow-y-auto">
        <div className="mx-auto w-full max-w-md space-y-8 pt-12 md:pt-0">
          
          {/* Logo on mobile only */}
          <div className="flex md:hidden justify-center pb-2">
            <img 
              src="/assets/domnak-logo-cream.png" 
              alt="Domnak Logo" 
              className="h-14 w-auto object-contain brightness-90 bg-brand-dark px-4 py-2 rounded-xl"
            />
          </div>

          {/* Form Header */}
          <div className="text-center space-y-2">
            <h2 className="text-3xl font-extrabold text-brand-dark tracking-tight">
              {isLogin ? "Welcome back" : "Create an account"}
            </h2>
            <p className="text-sm text-brand-dark/60">
              {isLogin ? "Sign in to access your Domnak projects" : "Join us to simplify your home building journey"}
            </p>
          </div>

          {/* Toggle Tab */}
          <div className="bg-brand-cream-dark p-1 rounded-full flex relative border border-brand-dark/5 shadow-inner">
            <button
              type="button"
              onClick={() => { setIsLogin(true); setError(""); setSuccess(""); }}
              className={`w-1/2 py-2.5 text-sm font-semibold rounded-full transition-all duration-300 ${
                isLogin 
                  ? "bg-brand-gold text-white shadow-md transform scale-101" 
                  : "text-brand-dark/70 hover:text-brand-dark"
              }`}
            >
              Sign In
            </button>
            <button
              type="button"
              onClick={() => { setIsLogin(false); setError(""); setSuccess(""); }}
              className={`w-1/2 py-2.5 text-sm font-semibold rounded-full transition-all duration-300 ${
                !isLogin 
                  ? "bg-brand-gold text-white shadow-md transform scale-101" 
                  : "text-brand-dark/70 hover:text-brand-dark"
              }`}
            >
              Create Account
            </button>
          </div>

          {/* Error and Success Notifications */}
          {error && (
            <div className="bg-rose-50 border border-rose-200 text-rose-800 p-3.5 rounded-xl flex items-start gap-2.5 text-sm animate-shake">
              <AlertCircle className="h-5 w-5 text-rose-600 shrink-0" />
              <span>{error}</span>
            </div>
          )}

          {success && (
            <div className="bg-emerald-50 border border-emerald-200 text-emerald-800 p-3.5 rounded-xl flex items-start gap-2.5 text-sm animate-pulse">
              <CheckCircle2 className="h-5 w-5 text-emerald-600 shrink-0" />
              <span>{success}</span>
            </div>
          )}

          {/* Auth Form */}
          <form onSubmit={handleSubmit} className="space-y-6">
            
            {/* ROLE SELECTOR GRID */}
            <div className="space-y-3">
              <label className="block text-xs font-bold uppercase tracking-wider text-brand-dark/70">
                Are you a Homeowner or Architect?
              </label>
              <div className="grid grid-cols-2 gap-4">
                
                {/* Homeowner Card */}
                <button
                  type="button"
                  onClick={() => setRole("homeowner")}
                  className={`flex flex-col items-center justify-center p-4 rounded-2xl border-2 text-center transition-all duration-200 hover:shadow-md ${
                    role === "homeowner"
                      ? "border-brand-gold bg-brand-gold/5 text-brand-dark"
                      : "border-brand-dark/10 bg-white text-brand-dark/60 hover:border-brand-gold/40"
                  }`}
                >
                  <div className={`p-2.5 rounded-full mb-2 ${role === "homeowner" ? "bg-brand-gold text-white" : "bg-brand-cream text-brand-dark/50"}`}>
                    <HomeIcon className="h-5 w-5" />
                  </div>
                  <span className="font-bold text-sm">Homeowner</span>
                  <span className="text-[10px] mt-0.5 opacity-80 leading-tight">I want to build my dream home</span>
                </button>

                {/* Architect Card */}
                <button
                  type="button"
                  onClick={() => setRole("architect")}
                  className={`flex flex-col items-center justify-center p-4 rounded-2xl border-2 text-center transition-all duration-200 hover:shadow-md ${
                    role === "architect"
                      ? "border-brand-gold bg-brand-gold/5 text-brand-dark"
                      : "border-brand-dark/10 bg-white text-brand-dark/60 hover:border-brand-gold/40"
                  }`}
                >
                  <div className={`p-2.5 rounded-full mb-2 ${role === "architect" ? "bg-brand-gold text-white" : "bg-brand-cream text-brand-dark/50"}`}>
                    <Compass className="h-5 w-5" />
                  </div>
                  <span className="font-bold text-sm">Architect</span>
                  <span className="text-[10px] mt-0.5 opacity-80 leading-tight">I design & build for clients</span>
                </button>

              </div>
            </div>

            {/* FORM INPUTS */}
            <div className="space-y-4">
              
              {/* Full Name (Sign Up Only) */}
              {!isLogin && (
                <div className="space-y-1.5">
                  <label htmlFor="name" className="block text-xs font-bold text-brand-dark/80">
                    Full Name
                  </label>
                  <div className="relative">
                    <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none text-brand-dark/40">
                      <User className="h-4.5 w-4.5" />
                    </div>
                    <input
                      id="name"
                      name="name"
                      type="text"
                      value={formData.name}
                      onChange={handleInputChange}
                      placeholder="e.g. Sophal Chan"
                      className="block w-full pl-10 pr-4 py-3 rounded-xl border border-brand-dark/10 bg-white text-brand-dark placeholder-brand-dark/30 text-sm focus:border-brand-gold focus:ring-1 focus:ring-brand-gold focus:outline-none transition-colors shadow-sm"
                    />
                  </div>
                </div>
              )}

              {/* Email Address */}
              <div className="space-y-1.5">
                <label htmlFor="email" className="block text-xs font-bold text-brand-dark/80">
                  Email Address
                </label>
                <div className="relative">
                  <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none text-brand-dark/40">
                    <Mail className="h-4.5 w-4.5" />
                  </div>
                  <input
                    id="email"
                    name="email"
                    type="email"
                    value={formData.email}
                    onChange={handleInputChange}
                    placeholder="e.g. sophal@example.com"
                    className="block w-full pl-10 pr-4 py-3 rounded-xl border border-brand-dark/10 bg-white text-brand-dark placeholder-brand-dark/30 text-sm focus:border-brand-gold focus:ring-1 focus:ring-brand-gold focus:outline-none transition-colors shadow-sm"
                  />
                </div>
              </div>

              {/* Company / Studio Name (Sign Up & Architect Only) */}
              {!isLogin && role === "architect" && (
                <div className="space-y-1.5">
                  <label htmlFor="company" className="block text-xs font-bold text-brand-dark/80">
                    Studio / Company Name
                  </label>
                  <div className="relative">
                    <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none text-brand-dark/40">
                      <Building2 className="h-4.5 w-4.5" />
                    </div>
                    <input
                      id="company"
                      name="company"
                      type="text"
                      value={formData.company}
                      onChange={handleInputChange}
                      placeholder="e.g. Angkor Architecture Studio"
                      className="block w-full pl-10 pr-4 py-3 rounded-xl border border-brand-dark/10 bg-white text-brand-dark placeholder-brand-dark/30 text-sm focus:border-brand-gold focus:ring-1 focus:ring-brand-gold focus:outline-none transition-colors shadow-sm"
                    />
                  </div>
                </div>
              )}

              {/* Password */}
              <div className="space-y-1.5">
                <div className="flex justify-between items-center">
                  <label htmlFor="password" className="block text-xs font-bold text-brand-dark/80">
                    Password
                  </label>
                  {isLogin && (
                    <Link href="#" className="text-xs font-semibold text-brand-gold hover:text-brand-gold-dark transition-colors">
                      Forgot Password?
                    </Link>
                  )}
                </div>
                <div className="relative">
                  <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none text-brand-dark/40">
                    <Lock className="h-4.5 w-4.5" />
                  </div>
                  <input
                    id="password"
                    name="password"
                    type={showPassword ? "text" : "password"}
                    value={formData.password}
                    onChange={handleInputChange}
                    placeholder="••••••••"
                    className="block w-full pl-10 pr-10 py-3 rounded-xl border border-brand-dark/10 bg-white text-brand-dark placeholder-brand-dark/30 text-sm focus:border-brand-gold focus:ring-1 focus:ring-brand-gold focus:outline-none transition-colors shadow-sm"
                  />
                  <button
                    type="button"
                    onClick={() => setShowPassword(!showPassword)}
                    className="absolute inset-y-0 right-0 pr-3 flex items-center text-brand-dark/30 hover:text-brand-dark/60"
                  >
                    {showPassword ? <EyeOff className="h-4.5 w-4.5" /> : <Eye className="h-4.5 w-4.5" />}
                  </button>
                </div>
              </div>

              {/* Confirm Password (Sign Up Only) */}
              {!isLogin && (
                <div className="space-y-1.5">
                  <label htmlFor="confirmPassword" className="block text-xs font-bold text-brand-dark/80">
                    Confirm Password
                  </label>
                  <div className="relative">
                    <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none text-brand-dark/40">
                      <Lock className="h-4.5 w-4.5" />
                    </div>
                    <input
                      id="confirmPassword"
                      name="confirmPassword"
                      type={showConfirmPassword ? "text" : "password"}
                      value={formData.confirmPassword}
                      onChange={handleInputChange}
                      placeholder="••••••••"
                      className="block w-full pl-10 pr-10 py-3 rounded-xl border border-brand-dark/10 bg-white text-brand-dark placeholder-brand-dark/30 text-sm focus:border-brand-gold focus:ring-1 focus:ring-brand-gold focus:outline-none transition-colors shadow-sm"
                    />
                    <button
                      type="button"
                      onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                      className="absolute inset-y-0 right-0 pr-3 flex items-center text-brand-dark/30 hover:text-brand-dark/60"
                    >
                      {showConfirmPassword ? <EyeOff className="h-4.5 w-4.5" /> : <Eye className="h-4.5 w-4.5" />}
                    </button>
                  </div>
                </div>
              )}

            </div>

            {/* Checkbox (Terms on Sign up, Remember me on Login) */}
            <div className="flex items-center">
              {isLogin ? (
                <div className="flex items-center gap-2">
                  <input
                    id="remember"
                    name="remember"
                    type="checkbox"
                    className="h-4 w-4 rounded border-brand-dark/20 text-brand-gold focus:ring-brand-gold accent-brand-gold"
                  />
                  <label htmlFor="remember" className="text-xs text-brand-dark/75">
                    Remember me on this device
                  </label>
                </div>
              ) : (
                <div className="flex items-start gap-2.5">
                  <input
                    id="agreeTerms"
                    name="agreeTerms"
                    type="checkbox"
                    checked={formData.agreeTerms}
                    onChange={handleInputChange}
                    className="h-4 w-4 rounded border-brand-dark/20 text-brand-gold focus:ring-brand-gold accent-brand-gold mt-0.5"
                  />
                  <label htmlFor="agreeTerms" className="text-xs text-brand-dark/75 leading-normal">
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
              className="w-full flex items-center justify-center rounded-xl bg-brand-gold px-4 py-3 text-sm font-bold text-white shadow-md hover:bg-brand-gold-dark focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-brand-gold transition-all duration-200 hover:shadow-lg disabled:opacity-75 disabled:cursor-not-allowed"
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

          </form>

        </div>
      </div>

    </div>
  );
}
