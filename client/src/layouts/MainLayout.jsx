import React from 'react';
import { Outlet } from 'react-router-dom';
import Navbar from '../components/common/Navbar';
import Footer from '../components/common/Footer';

const MainLayout = () => {
  return (
    <div className="flex flex-col min-h-screen bg-luxury-black text-luxury-text selection:bg-luxury-gold selection:text-black">
      <Navbar />
      <main className="flex-grow">
        <Outlet />
      </main>
      <Footer />
    </div>
  );
};

export default MainLayout;
