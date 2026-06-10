import React from 'react';
import { Menu, Bell } from 'lucide-react';
import { Link } from 'react-router-dom';

const TopNav = () => {
  return (
    <div className="fixed top-0 left-0 right-0 bg-white border-b border-gray-100 z-50">
      <header className="h-16 flex items-center justify-between px-4 max-w-7xl mx-auto w-full">
        <button className="p-2 -ml-2 text-gray-600 hover:bg-gray-50 rounded-full">
          <Menu className="w-6 h-6" />
        </button>
      
      <Link to="/" className="text-xl font-bold text-agri-dark tracking-tight">
        AgriGrow
      </Link>
      
      <button className="p-2 -mr-2 text-gray-600 hover:bg-gray-50 rounded-full relative">
        <Bell className="w-6 h-6" />
        <span className="absolute top-2 right-2 w-2 h-2 bg-red-500 rounded-full border border-white"></span>
      </button>
      </header>
    </div>
  );
};

export default TopNav;
