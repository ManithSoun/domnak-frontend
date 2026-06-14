import Link from "next/link";

export default function Footer() {
  const footerNavigation = {
    resources: [
      { name: "Estimator tool", href: "#" },
      { name: "BOQ Generator", href: "#" },
      { name: "Guides & Docs", href: "#" },
      { name: "Support", href: "#" },
    ],
    products1: [
      { name: "For Homeowners", href: "#" },
      { name: "For Architects", href: "#" },
      { name: "Material Sourcing", href: "#" },
      { name: "Supplier", href: "#" },
    ],
    products2: [
      { name: "For Homeowners", href: "#" },
      { name: "For Architects", href: "#" },
      { name: "Material Sourcing", href: "#" },
      { name: "Supplier", href: "#" },
    ],
  };

  return (
    <footer className="bg-[#b38e42] text-white" aria-labelledby="footer-heading">
      <h2 id="footer-heading" className="sr-only">
        Footer
      </h2>
      <div className="mx-auto max-w-5xl px-6 py-16 sm:py-20 lg:px-8">
        <div className="xl:grid xl:grid-cols-3 xl:gap-8">
          {/* Brand Column */}
          <div className="space-y-6">
            <Link href="/" className="flex items-center group">
              <img
                src="/assets/domnak-logo-with-kh-cream.png"
                alt="DomNak Logo"
                className="h-14 w-auto object-contain transition-transform group-hover:scale-102"
              />
            </Link>
            <p className="text-xs leading-5 text-white/85 max-w-xs">
              Optimize construction estimation and execution with transparency, reliability, and precision. Built for homeowners, architects, and builders.
            </p>
          </div>

          {/* Links Columns */}
          <div className="mt-16 grid grid-cols-3 gap-8 xl:col-span-2 xl:mt-0">
            <div>
              <h3 className="text-xs font-bold leading-6 uppercase tracking-wider text-[#201b12]">
                Resources
              </h3>
              <ul role="list" className="mt-6 space-y-4">
                {footerNavigation.resources.map((item) => (
                  <li key={item.name}>
                    <Link
                      href={item.href}
                      className="text-xs leading-6 text-white/90 hover:text-[#201b12] transition-colors"
                    >
                      {item.name}
                    </Link>
                  </li>
                ))}
              </ul>
            </div>
            <div>
              <h3 className="text-xs font-bold leading-6 uppercase tracking-wider text-[#201b12]">
                Products
              </h3>
              <ul role="list" className="mt-6 space-y-4">
                {footerNavigation.products1.map((item, idx) => (
                  <li key={idx}>
                    <Link
                      href={item.href}
                      className="text-xs leading-6 text-white/90 hover:text-[#201b12] transition-colors"
                    >
                      {item.name}
                    </Link>
                  </li>
                ))}
              </ul>
            </div>
            <div>
              <h3 className="text-xs font-bold leading-6 uppercase tracking-wider text-[#201b12]">
                Products
              </h3>
              <ul role="list" className="mt-6 space-y-4">
                {footerNavigation.products2.map((item, idx) => (
                  <li key={idx}>
                    <Link
                      href={item.href}
                      className="text-xs leading-6 text-white/90 hover:text-[#201b12] transition-colors"
                    >
                      {item.name}
                    </Link>
                  </li>
                ))}
              </ul>
            </div>
          </div>
        </div>

        {/* Bottom Bar */}
        <div className="mt-16 border-t border-white/20 pt-8 sm:mt-20 lg:mt-24 flex flex-col md:flex-row md:items-center md:justify-between gap-4">
          <p className="text-xs leading-5 text-white/70 order-2 md:order-1">
            &copy; {new Date().getFullYear()} DomNak. All rights reserved.
          </p>
          <div className="flex gap-x-6 order-1 md:order-2">
            <Link href="#" className="text-xs leading-5 text-white/80 hover:text-[#201b12] transition-colors">
              Terms of Use
            </Link>
            <Link href="#" className="text-xs leading-5 text-white/80 hover:text-[#201b12] transition-colors">
              Privacy Policy
            </Link>
            <Link href="#" className="text-xs leading-5 text-white/80 hover:text-[#201b12] transition-colors">
              Feedback
            </Link>
          </div>
        </div>
      </div>
    </footer>
  );
}
