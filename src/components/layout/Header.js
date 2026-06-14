"use client";

import { useState } from "react";
import Link from "next/link";
import { Menu, X } from "lucide-react";

export default function Header() {
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  const navigation = [
    { name: "How it works", href: "#how-it-works" },
    { name: "Features", href: "#features" },
    { name: "About us", href: "#about-us" },
  ];

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
                className="text-sm font-medium text-brand-dark/80 hover:text-brand-gold transition-colors duration-200"
              >
                {item.name}
              </Link>
            ))}
          </nav>

          {/* Desktop Call to Action */}
          <div className="hidden md:flex items-center">
            <Link
              href="#get-started"
              className="inline-flex items-center justify-center rounded-full bg-brand-gold px-6 py-2.5 text-sm font-semibold text-white shadow-sm hover:bg-brand-gold-dark transition-all duration-200 hover:shadow"
            >
              Get Started
            </Link>
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
                onClick={() => setMobileMenuOpen(false)}
                className="block text-base font-semibold text-brand-dark hover:text-brand-gold transition-colors"
              >
                {item.name}
              </Link>
            ))}
            <div className="pt-4 border-t border-brand-dark/5">
              <Link
                href="#get-started"
                onClick={() => setMobileMenuOpen(false)}
                className="flex w-full items-center justify-center rounded-full bg-brand-gold px-4 py-3 text-base font-bold text-white shadow-sm hover:bg-brand-gold-dark transition-colors"
              >
                Get Started
              </Link>
            </div>
          </div>
        </div>
      )}
    </header>
  );
}
