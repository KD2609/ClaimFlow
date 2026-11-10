import React from 'react';
import { Outlet } from 'react-router-dom';
import Navbar from './Navbar';

const Layout = () => {
  return (
    <div className="min-h-screen bg-[#F7F8F6] flex flex-col w-full">
      <Navbar />
      <main className="flex-1 w-full px-4 sm:px-6 lg:px-8 xl:px-10 py-6 sm:py-8">
        <div className="w-full max-w-[1920px] mx-auto space-y-6">
          <Outlet />
        </div>
      </main>
    </div>
  );
};

export default Layout;
