"use client";

import { useState } from "react";
import Link from "next/link";
import { useRouter } from "next/router";
import { useAuth } from "../../../router/useAuth";
import { Menu, X, LogOut, User as UserIcon } from "lucide-react";

export default function Header() {
  const router = useRouter();
  const { user, logout } = useAuth();
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  const navigation = [
    { name: "Features", href: "/#features" },
    { name: "About us", href: "/#about-us" },
    { name: "How it works", href: "/#how-it-works" },
    { name: "Chatbot", href: "/chatbot" },
    { name: "Supplier", href: "/supplier" },
  ];

  const handleNavClick = (e, item) => {
    if (item.href.startsWith("/#") && (router.pathname === "/" || router.pathname === "/home")) {
      e.preventDefault();
      const id = item.href.replace("/#", "");
      const element = document.getElementById(id);
      if (element) {
        element.scrollIntoView({ behavior: "smooth" });
        window.history.pushState(null, "", `#${id}`);
      }
    }
  };

  return (
    <header className="sticky top-0 z-50 w-full border-b border-brand-dark/10 bg-background/80 backdrop-blur-md">
      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        <div className="flex h-20 items-center justify-between">
          <div className="flex items-center">
            <Link href="/" className="flex items-center group">
              <img
                src="/assets/domnak-logo-with-kh-cream.png"
                alt="DomNak Logo"
                className="h-16 w-auto object-contain transition-transform group-hover:scale-102"
              />
            </Link>
          </div>

          {/* Desktop Navigation */}
          <nav className="hidden md:flex items-center space-x-8">
            {navigation.map((item) => (
              <Link
                key={item.name}
                href={item.href}
                onClick={(e) => handleNavClick(e, item)}
                className="text-sm font-medium text-brand-dark/80 hover:text-brand-gold transition-colors duration-200"
              >
                {item.name}
              </Link>
            ))}
          </nav>

          {/* Desktop Call to Action / Auth details */}
          <div className="hidden md:flex items-center space-x-4">
            {user ? (
              <>
                <Link
                  href={user.role === "architect" ? "/architect" : "/homeowners"}
                  className="flex items-center gap-1.5 text-sm font-bold text-brand-dark hover:text-brand-gold transition-colors"
                >
                  <UserIcon className="h-4 w-4 text-brand-gold" />
                  <span>{user.name || "My Portal"}</span>
                </Link>
                <button
                  type="button"
                  onClick={logout}
                  className="inline-flex items-center justify-center gap-1.5 rounded-full bg-brand-dark/5 hover:bg-brand-dark/10 px-4 py-2 text-xs font-semibold text-brand-dark transition-all duration-200 cursor-pointer"
                >
                  <LogOut className="h-3.5 w-3.5" />
                  Log Out
                </button>
              </>
            ) : (
              <Link
                href="/login"
                className="inline-flex items-center justify-center rounded-full bg-brand-gold px-6 py-2.5 text-sm font-semibold text-white shadow-sm hover:bg-brand-gold-dark transition-all duration-200 hover:shadow"
              >
                Get Started
              </Link>
            )}
          </div>

          {/* Mobile Menu Button */}
          <div className="flex md:hidden">
            <button
              type="button"
              className="-m-2.5 inline-flex items-center justify-center rounded-md p-2.5 text-brand-dark hover:text-brand-gold transition-colors"
              onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
            >
              <span className="sr-only">Open main menu</span>
              {mobileMenuOpen ? (
                <X className="h-6 w-6" aria-hidden="true" />
              ) : (
                <Menu className="h-6 w-6" aria-hidden="true" />
              )}
            </button>
          </div>
        </div>
      </div>

      {/* Mobile Menu Panel */}
      {mobileMenuOpen && (
        <div className="md:hidden border-b border-brand-dark/10 bg-white px-4 py-6 shadow-lg animate-in slide-in-from-top-5 duration-200">
          <div className="space-y-4">
            {navigation.map((item) => (
              <Link
                key={item.name}
                href={item.href}
                onClick={(e) => {
                  setMobileMenuOpen(false);
                  handleNavClick(e, item);
                }}
                className="block text-base font-semibold text-brand-dark hover:text-brand-gold transition-colors"
              >
                {item.name}
              </Link>
            ))}
             <div className="pt-4 border-t border-brand-dark/5 space-y-3">
              {user ? (
                <>
                  <Link
                    href={user.role === "architect" ? "/architect" : "/homeowners"}
                    onClick={() => setMobileMenuOpen(false)}
                    className="flex w-full items-center justify-center gap-2 rounded-full border border-brand-dark/10 px-4 py-3 text-base font-bold text-brand-dark bg-white shadow-sm hover:bg-brand-cream-dark transition-colors"
                  >
                    <UserIcon className="h-5 w-5 text-brand-gold" />
                    <span>{user.name || "My Dashboard"}</span>
                  </Link>
                  <button
                    type="button"
                    onClick={() => {
                      setMobileMenuOpen(false);
                      logout();
                    }}
                    className="flex w-full items-center justify-center gap-2 rounded-full bg-rose-50 border border-rose-200 px-4 py-3 text-base font-bold text-rose-700 shadow-sm hover:bg-rose-100 transition-colors cursor-pointer"
                  >
                    <LogOut className="h-5 w-5" />
                    Log Out
                  </button>
                </>
              ) : (
                <Link
                  href="/login"
                  onClick={() => setMobileMenuOpen(false)}
                  className="flex w-full items-center justify-center rounded-full bg-brand-gold px-4 py-3 text-base font-bold text-white shadow-sm hover:bg-brand-gold-dark transition-colors"
                >
                  Get Started
                </Link>
              )}
            </div>
          </div>
        </div>
      )}
    </header>
  );
}
