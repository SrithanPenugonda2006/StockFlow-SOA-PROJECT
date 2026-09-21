import React from 'react';
import { Outlet } from 'react-router-dom';
import { Navbar } from '../components/layout/Navbar';

export const CustomerLayout: React.FC = () => {
  return (
    <div className="min-h-screen bg-[#F7F8FA] text-gray-900 flex flex-col">
      <Navbar />
      <main className="flex-1 max-w-7xl w-full mx-auto p-6">
        <Outlet />
      </main>
      <footer className="bg-[#F7F8FA] border-t border-gray-200 py-8 text-center text-xs text-gray-400">
        StockFlow Catalog Store &copy; 2026 OmniStock Ecosystem. All Rights Reserved.
      </footer>
    </div>
  );
};
