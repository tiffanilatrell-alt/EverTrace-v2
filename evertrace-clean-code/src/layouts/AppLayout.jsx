import { Leaf, Menu } from "lucide-react";
import { Link, NavLink, Outlet } from "react-router-dom";

const navItems = [
  { label: "Home", to: "/" },
  { label: "Start", to: "/start" },
  { label: "Example", to: "/example" },
];

const footerLinks = [
  { label: "About Us", to: "/about" },
  { label: "FAQs", to: "/faq" },
  { label: "Related Articles", to: "/resources" },
  { label: "Contact", to: "mailto:hello@evertrace.life" },
  { label: "Privacy Policy", to: "#" },
  { label: "Terms", to: "#" },
];

export default function AppLayout() {
  return (
    <div className="min-h-screen bg-cream text-ink">
      <header className="sticky top-0 z-20 border-b border-ink/10 bg-cream/90 backdrop-blur">
        <div className="mx-auto flex h-16 w-full max-w-6xl items-center justify-between px-4 sm:px-6">
          <Link to="/" className="flex items-center gap-2 font-semibold tracking-tight">
            <span className="grid size-9 place-items-center rounded-full bg-deep-purple text-white">
              <Leaf size={17} fill="currentColor" />
            </span>
            <span>EverTrace</span>
          </Link>

          <nav className="hidden items-center gap-1 rounded-full border border-rich-purple/35 bg-white/70 p-1 text-sm font-medium sm:flex">
            {navItems.map((item) => (
              <NavLink
                key={item.to}
                to={item.to}
                className={({ isActive }) =>
                  `rounded-full px-4 py-2 transition ${
                    isActive ? "bg-deep-purple text-white" : "text-ink/70 hover:bg-rich-purple/5 hover:text-ink"
                  }`
                }
              >
                {item.label}
              </NavLink>
            ))}
          </nav>

          <button className="grid size-10 place-items-center rounded-full border border-rich-purple/35 bg-white/70 text-ink sm:hidden">
            <Menu size={20} />
          </button>
        </div>
      </header>

      <Outlet />

      <footer className="border-t border-ink/10 px-4 py-10 text-sm text-ink/60">
        <div className="mx-auto flex max-w-6xl flex-col gap-6 sm:flex-row sm:items-center sm:justify-between">
          <p className="text-center sm:text-left">EverTrace V2. Digital tributes first, QR plaques when the family is ready.</p>
          <nav className="flex flex-wrap items-center justify-center gap-x-5 gap-y-3 sm:justify-end">
            {footerLinks.map((link) =>
              link.to.startsWith("mailto") ? (
                <a key={link.label} href={link.to} className="font-medium transition hover:text-deep-purple">
                  {link.label}
                </a>
              ) : link.to === "#" ? (
                <a key={link.label} href={link.to} className="font-medium transition hover:text-deep-purple">
                  {link.label}
                </a>
              ) : (
                <Link key={link.label} to={link.to} className="font-medium transition hover:text-deep-purple">
                  {link.label}
                </Link>
              ),
            )}
            <a
              href="https://www.facebook.com/"
              className="inline-flex items-center gap-2 font-medium transition hover:text-deep-purple"
              aria-label="EverTrace on Facebook"
            >
              <span className="grid size-5 place-items-center rounded-full bg-deep-purple text-xs font-bold text-white">f</span> Facebook
            </a>
          </nav>
        </div>
      </footer>
    </div>
  );
}