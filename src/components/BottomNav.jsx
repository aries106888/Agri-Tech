import React from 'react';
import { Home, Info, Store, User, Truck, Shield } from 'lucide-react';
import { NavLink, useLocation } from 'react-router-dom';
import clsx from 'clsx';

const BottomNav = () => {
  const location = useLocation();
  
  // Dynamic navigation based on current route to mock the behavior seen in screenshots
  const isBuyer = location.pathname.includes('buyer');
  const isAdmin = location.pathname.includes('admin');
  
  const navItems = [
    { icon: Home, label: 'Home', path: '/' },
    { 
      icon: isAdmin ? Shield : (isBuyer ? Truck : Info), 
      label: isAdmin ? 'Admin' : (isBuyer ? 'Track' : 'About'), 
      path: isAdmin ? '/admin/dashboard' : (isBuyer ? '/buyer/dashboard' : '/about') 
    },
    { icon: Store, label: 'Market', path: '/market' },
    { icon: User, label: 'Profile', path: '/farmer/dashboard' }, // Route to farmer dashboard as a placeholder for profile
  ];

  return (
    <div className="fixed bottom-0 left-0 right-0 bg-white border-t border-gray-100 z-50">
      <nav className="h-20 px-6 max-w-7xl mx-auto w-full">
        <ul className="flex items-center justify-between h-full">
          {navItems.map((item) => {
          const Icon = item.icon;
          // Exact match for home, partial for others
          const isActive = item.path === '/' ? location.pathname === '/' : location.pathname.startsWith(item.path);
          
          return (
            <li key={item.label}>
              <NavLink
                to={item.path}
                className={clsx(
                  "flex flex-col items-center justify-center space-y-1 w-16 h-16 rounded-full transition-colors",
                  isActive ? "text-agri-dark" : "text-gray-500 hover:text-agri-green"
                )}
              >
                <div className={clsx(
                  "flex items-center justify-center p-2 rounded-full",
                  isActive && ['Market', 'Profile', 'Home', 'Admin'].includes(item.label) && "bg-agri-dark text-white"
                )}>
                   <Icon className="w-6 h-6" strokeWidth={isActive ? 2.5 : 2} />
                </div>
                <span className={clsx(
                  "text-xs font-medium",
                  isActive && !['Market', 'Profile', 'Home', 'Admin'].includes(item.label) ? "text-agri-dark font-semibold" : ""
                )}>
                  {item.label}
                </span>
              </NavLink>
            </li>
          );
        })}
        </ul>
      </nav>
    </div>
  );
};

export default BottomNav;
