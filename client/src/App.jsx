import React from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import { AuthProvider } from './context/AuthContext';
import MainLayout from './layouts/MainLayout';
import Home from './pages/Home';

import Portfolio from './pages/Portfolio';
import Services from './pages/Services';
import Booking from './pages/Booking';
import Contact from './pages/Contact';

// Admin imports
import AdminLayout from './layouts/AdminLayout';
import Dashboard from './pages/admin/Dashboard';
import Bookings from './pages/admin/Bookings';
import Login from './pages/admin/Login';
import GalleryManager from './pages/admin/GalleryManager';
import ServiceManager from './pages/admin/ServiceManager';
import Settings from './pages/admin/Settings';
import Queries from './pages/admin/Queries';

function App() {
  return (
    <AuthProvider>
      <Router>
        <Routes>
          {/* Public Routes */}
          <Route path="/" element={<MainLayout />}>
            <Route index element={<Home />} />
            <Route path="portfolio" element={<Portfolio />} />
            <Route path="services" element={<Services />} />
            <Route path="book" element={<Booking />} />
            <Route path="contact" element={<Contact />} />
          </Route>

          {/* Admin Routes */}
          <Route path="/admin/login" element={<Login />} />
          
          <Route path="/admin" element={<AdminLayout />}>
            <Route index element={<Dashboard />} />
            <Route path="bookings" element={<Bookings />} />
            <Route path="queries" element={<Queries />} />
            <Route path="gallery" element={<GalleryManager />} />
            <Route path="services" element={<ServiceManager />} />
            <Route path="settings" element={<Settings />} />
            {/* Redirect any invalid admin path back to admin dashboard */}
            <Route path="*" element={<Navigate to="/admin" replace />} />
          </Route>

          {/* Global redirect for non-matching public paths */}
          <Route path="*" element={<Navigate to="/" replace />} />
        </Routes>
      </Router>
    </AuthProvider>
  );
}

export default App;
