import { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { HeartPulse, Menu, X, LogOut } from "lucide-react";
import { Button } from "@/components/ui/button";
import { useAuth } from "@/context/AuthContext";

const Navbar = () => {
  const { user, logout } = useAuth();
  const navigate = useNavigate();
  const [open, setOpen] = useState(false);

  const links = [
    { to: "/", label: "Home", testid: "nav-home-link" },
    { to: "/services", label: "Book a Service", testid: "nav-services-link" },
    { to: "/plans", label: "Care Plans", testid: "nav-plans-link" },
  ];

  return (
    <header className="sticky top-0 z-50 bg-white/95 backdrop-blur-xl border-b border-[#E2E8DE]">
      <div className="max-w-7xl mx-auto px-4 sm:px-8 h-20 flex items-center justify-between">
        <Link to="/" data-testid="nav-logo" className="flex items-center gap-3">
          <span className="bg-primary text-white rounded-2xl p-2.5">
            <HeartPulse size={26} strokeWidth={1.8} />
          </span>
          <span className="font-heading font-bold text-2xl text-primary">Alderly</span>
        </Link>

        <nav className="hidden md:flex items-center gap-8">
          {links.map((l) => (
            <Link
              key={l.to}
              to={l.to}
              data-testid={l.testid}
              className="text-lg font-medium text-foreground hover:text-secondary transition-colors"
            >
              {l.label}
            </Link>
          ))}
          {user && (
            <Link
              to="/dashboard"
              data-testid="nav-dashboard-link"
              className="text-lg font-medium text-foreground hover:text-secondary transition-colors"
            >
              My Dashboard
            </Link>
          )}
        </nav>

        <div className="hidden md:flex items-center gap-3">
          {user ? (
            <Button
              variant="outline"
              data-testid="nav-logout-button"
              className="rounded-full h-12 px-6 text-base"
              onClick={() => {
                logout();
                navigate("/");
              }}
            >
              <LogOut size={18} className="mr-2" /> Sign Out
            </Button>
          ) : (
            <>
              <Link to="/login" data-testid="nav-login-link">
                <Button variant="outline" className="rounded-full h-12 px-6 text-base">Sign In</Button>
              </Link>
              <Link to="/signup" data-testid="nav-get-started-link">
                <Button className="rounded-full h-12 px-6 text-base bg-secondary hover:bg-secondary/90 text-white">
                  Get Started
                </Button>
              </Link>
            </>
          )}
        </div>

        <button
          className="md:hidden p-2"
          data-testid="nav-mobile-menu-button"
          onClick={() => setOpen(!open)}
          aria-label="Toggle menu"
        >
          {open ? <X size={28} /> : <Menu size={28} />}
        </button>
      </div>

      {open && (
        <div className="md:hidden border-t border-[#E2E8DE] bg-white px-6 py-4 flex flex-col gap-4">
          {links.map((l) => (
            <Link
              key={l.to}
              to={l.to}
              data-testid={`${l.testid}-mobile`}
              className="text-lg font-medium"
              onClick={() => setOpen(false)}
            >
              {l.label}
            </Link>
          ))}
          {user ? (
            <>
              <Link to="/dashboard" data-testid="nav-dashboard-link-mobile" className="text-lg font-medium" onClick={() => setOpen(false)}>
                My Dashboard
              </Link>
              <button
                data-testid="nav-logout-button-mobile"
                className="text-left text-lg font-medium text-secondary"
                onClick={() => {
                  logout();
                  setOpen(false);
                  navigate("/");
                }}
              >
                Sign Out
              </button>
            </>
          ) : (
            <>
              <Link to="/login" data-testid="nav-login-link-mobile" className="text-lg font-medium" onClick={() => setOpen(false)}>
                Sign In
              </Link>
              <Link to="/signup" data-testid="nav-get-started-link-mobile" className="text-lg font-medium text-secondary" onClick={() => setOpen(false)}>
                Get Started
              </Link>
            </>
          )}
        </div>
      )}
    </header>
  );
};

export default Navbar;
