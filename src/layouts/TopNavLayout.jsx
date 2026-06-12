import { useState } from 'react';
import { Outlet, Link, useLocation } from 'react-router-dom';
import { Leaf, Menu, X } from 'lucide-react';

const TopNavLayout = () => {
  const [mobileOpen, setMobileOpen] = useState(false);
  const location = useLocation();

  const navLinks = [
    { label: 'Home', path: '/' },
    { label: 'Marketplace', path: '/market' },
    { label: 'How It Works', path: '/how-it-works' },
    { label: 'About', path: '/about' },
  ];

  return (
    <div className="min-h-screen bg-ag-canvas flex flex-col">
      {/* TOP NAV */}
      <header className="bg-ag-primary sticky top-0 z-50 shadow-sm">
        <div className="max-w-desktop mx-auto px-12 h-16 flex items-center justify-between">
          {/* Logo */}
          <Link to="/" className="flex items-center gap-2 text-white font-extrabold text-xl tracking-tight">
            <Leaf className="w-6 h-6 text-ag-primary-fixed" />
            ShambaPoint
          </Link>

          {/* Desktop Nav Links */}
          <nav className="hidden md:flex items-center gap-8">
            {navLinks.map(link => (
              <Link
                key={link.path}
                to={link.path}
                className={`text-sm font-bold transition-colors ${
                  location.pathname === link.path
                    ? 'text-ag-primary-fixed'
                    : 'text-white/80 hover:text-white'
                }`}
              >
                {link.label}
              </Link>
            ))}
          </nav>

          {/* CTA Buttons */}
          <div className="hidden md:flex items-center gap-3">
            <Link to="/login" className="text-white font-bold text-sm border-2 border-white/40 px-5 py-2.5 rounded-btn hover:border-white/80 transition-colors">
              Login
            </Link>
            <Link to="/signup" className="btn-primary !min-h-0 !py-2.5 !text-sm">
              Sign Up
            </Link>
          </div>

          {/* Mobile Hamburger */}
          <button
            onClick={() => setMobileOpen(!mobileOpen)}
            className="md:hidden text-white p-2"
          >
            {mobileOpen ? <X className="w-6 h-6" /> : <Menu className="w-6 h-6" />}
          </button>
        </div>

        {/* Mobile Menu */}
        {mobileOpen && (
          <div className="md:hidden bg-ag-primary-cont border-t border-white/10 px-6 py-4 flex flex-col gap-4">
            {navLinks.map(link => (
              <Link key={link.path} to={link.path} className="text-white font-bold" onClick={() => setMobileOpen(false)}>
                {link.label}
              </Link>
            ))}
            <div className="flex gap-3 pt-2">
              <Link to="/login" className="flex-1 text-center text-white font-bold text-sm border-2 border-white/40 px-4 py-2.5 rounded-btn">Login</Link>
              <Link to="/signup" className="flex-1 text-center bg-ag-amber text-white font-bold text-sm px-4 py-2.5 rounded-btn">Sign Up</Link>
            </div>
          </div>
        )}
      </header>

      {/* Page Content */}
      <main className="flex-1">
        <Outlet />
      </main>
    </div>
  );
};

export default TopNavLayout;
