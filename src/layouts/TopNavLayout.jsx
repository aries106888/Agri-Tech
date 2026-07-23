import { useState } from 'react';
import { Outlet, Link, useLocation, useNavigate } from 'react-router-dom';
import { Leaf, Menu, X } from 'lucide-react';
import { useAuth } from '../contexts/AuthContext';

const navLinkClass = (active) =>
  `text-sm font-semibold transition-colors ${active ? 'text-ag-primary-fixed' : 'text-white/80 hover:text-white'}`;

const TopNavLayout = () => {
  const [mobileOpen, setMobileOpen] = useState(false);
  const location = useLocation();
  const navigate = useNavigate();
  const { user, role } = useAuth();

  const [clickCount, setClickCount] = useState(0);
  const [clickTimeout, setClickTimeout] = useState(null);

  const handleLogoClick = (e) => {
    e.preventDefault();
    if (clickTimeout) clearTimeout(clickTimeout);
    const nextCount = clickCount + 1;
    if (nextCount >= 5) {
      setClickCount(0);
      setClickTimeout(null);
      navigate('/admin/login');
    } else {
      setClickCount(nextCount);
      const timeout = setTimeout(() => {
        setClickCount(0);
        navigate('/');
      }, 400);
      setClickTimeout(timeout);
    }
  };

  const dashPath = role ? `/${role}/dashboard` : '/';

  // Always show Home | Marketplace | Login | Sign Up | Admin Portal (plus Dashboard if logged in)
  const allLinks = [
    { label: 'Home', path: '/' },
    { label: 'Marketplace', path: '/market' },
    { label: 'Login', path: '/login' },
    { label: 'Sign Up', path: '/signup' },
    { label: 'Admin Portal', path: user && role === 'admin' ? '/admin/dashboard' : '/admin/login' },
    ...(user ? [{ label: 'Dashboard', path: dashPath }] : []),
  ];

  return (
    <div className="min-h-screen bg-ag-canvas flex flex-col">
      {/* TOP NAV */}
      <header className="bg-ag-primary sticky top-0 z-50 shadow-sm">
        <div className="max-w-desktop mx-auto px-12 h-16 flex items-center justify-between">

          {/* Logo */}
          <Link
            to="/"
            onClick={handleLogoClick}
            className="flex items-center gap-2 text-white font-extrabold text-xl tracking-tight shrink-0"
          >
            <Leaf className="w-6 h-6 text-ag-primary-fixed" />
            ShambaPoint
          </Link>

          {/* Desktop Nav — always displays Home | Marketplace | Login | Sign Up | Admin Portal */}
          <nav className="hidden md:flex items-center gap-8">
            {allLinks.map(link => (
              <Link
                key={link.label}
                to={link.path}
                className={navLinkClass(location.pathname === link.path)}
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
          <div className="md:hidden bg-ag-primary border-t border-white/10 px-6 py-4 flex flex-col gap-4">
            {allLinks.map(link => (
              <Link
                key={link.label}
                to={link.path}
                className="text-white/80 font-semibold text-sm hover:text-white"
                onClick={() => setMobileOpen(false)}
              >
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
