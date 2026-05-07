import { Leaf, Menu } from "lucide-react";
import { Link, NavLink, Outlet } from "react-router-dom";

const navItems = [
  { label: "Home", to: "/" },
  { label: "Start", to: "/start" },
  { label: "Example", to: "/example" },
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

      <footer className="border-t border-ink/10 px-4 py-8 text-center text-sm text-ink/60">
        EverTrace V2. Digital tributes first, QR plaques when the family is ready.
      </footer>
    </div>
  );
}
