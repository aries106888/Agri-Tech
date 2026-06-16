import { useState } from 'react';
import { Outlet, Link, useLocation } from 'react-router-dom';
import { Leaf, Menu, X } from 'lucide-react';

const TopNavLayout = () => {
  const [mobileOpen, setMobileOpen] = useState(false);
  const location = useLocation();

  const navLinks = [
    { label: 'Home', path: '/' },
    { label: 'Marketplace', path: '/market' },
    { label: 'Login', path: '/login' },
    { label: 'Sign Up', path: '/signup' },
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

