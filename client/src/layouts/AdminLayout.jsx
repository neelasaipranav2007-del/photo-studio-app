import React, { useState, useEffect, useContext } from 'react';
import { Outlet, Link, useNavigate, Navigate, useLocation } from 'react-router-dom';
import { FiHome, FiImage, FiBriefcase, FiCalendar, FiSettings, FiLogOut, FiMessageSquare, FiFileText } from 'react-icons/fi';
import { AuthContext } from '../context/AuthContext';
import axios from 'axios';

const AdminLayout = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const { user, logout, loading } = useContext(AuthContext);
  const [logoUrl, setLogoUrl] = useState('');
  const [siteName, setSiteName] = useState('');

  useEffect(() => {
    const fetchSettings = async () => {
      try {
        const { data } = await axios.get('/api/settings');
        if (data) {
          setLogoUrl(data.logoUrl || '');
          setSiteName(data.siteName || '');
        }
      } catch (err) {
        console.error('Error fetching settings in AdminLayout:', err);
      }
    };
    if (user) {
      fetchSettings();
    }
  }, [user]);

  const handleLogout = () => {
    logout();
    navigate('/admin/login');
  };

  if (loading) {
    return <div className="min-h-screen bg-black flex items-center justify-center text-luxury-gold">Loading...</div>;
  }

  if (!user || user.role !== 'admin') {
    return <Navigate to="/admin/login" replace />;
  }

  return (
    <div className="flex h-screen bg-luxury-black text-luxury-text overflow-hidden selection:bg-luxury-gold selection:text-black">
      {/* Sidebar */}
      <aside className="w-64 glass border-r border-white/10 flex flex-col transition-all">
        <div className="p-6 border-b border-white/10 flex flex-col items-center justify-center min-h-[85px]">
          {logoUrl ? (
            <img src={logoUrl} alt={siteName || 'Studio Logo'} className="max-h-12 max-w-[200px] object-contain" />
          ) : (
            <h2 className="text-xl font-serif text-white tracking-widest uppercase text-center">
              Admin<span className="text-luxury-gold">Panel</span>
            </h2>
          )}
        </div>
        
        <nav className="flex-1 overflow-y-auto py-4">
          <ul className="space-y-1">
            <li>
              <Link to="/admin" className="flex items-center px-6 py-3 text-gray-300 hover:bg-white/5 hover:text-luxury-gold transition-colors">
                <FiHome className="mr-3" /> Dashboard
              </Link>
            </li>
            <li>
              <Link to="/admin/bookings" className="flex items-center px-6 py-3 text-gray-300 hover:bg-white/5 hover:text-luxury-gold transition-colors">
                <FiCalendar className="mr-3" /> Bookings
              </Link>
            </li>
            <li>
              <Link to="/admin/queries" className="flex items-center px-6 py-3 text-gray-300 hover:bg-white/5 hover:text-luxury-gold transition-colors">
                <FiMessageSquare className="mr-3" /> Queries
              </Link>
            </li>
            <li>
              <Link to="/admin/gallery" className="flex items-center px-6 py-3 text-gray-300 hover:bg-white/5 hover:text-luxury-gold transition-colors">
                <FiImage className="mr-3" /> Gallery
              </Link>
            </li>
            <li>
              <Link to="/admin/services" className="flex items-center px-6 py-3 text-gray-300 hover:bg-white/5 hover:text-luxury-gold transition-colors">
                <FiBriefcase className="mr-3" /> Services
              </Link>
            </li>
            <li>
              <Link to="/admin/settings" className="flex items-center px-6 py-3 text-gray-300 hover:bg-white/5 hover:text-luxury-gold transition-colors">
                <FiSettings className="mr-3" /> Settings
              </Link>
            </li>
          </ul>
        </nav>
        
        <div className="p-4 border-t border-white/10">
          <button 
            onClick={handleLogout}
            className="flex items-center w-full px-4 py-2 text-red-400 hover:bg-red-500/10 hover:text-red-300 rounded transition-colors"
          >
            <FiLogOut className="mr-3" /> Logout
          </button>
        </div>
      </aside>

      {/* Main Content Area */}
      <main className="flex-1 flex flex-col h-screen overflow-hidden bg-[#050505]">
        {/* Top Header */}
        <header className="h-16 glass border-b border-white/10 flex items-center justify-between px-8 z-10">
          <h1 className="text-lg font-serif text-white tracking-widest">
            {location.pathname === '/admin' ? 'Dashboard Overview' :
             location.pathname === '/admin/bookings' ? 'Booking Management' :
             location.pathname === '/admin/queries' ? 'Customer Queries' :
             location.pathname === '/admin/gallery' ? 'Gallery Portfolio Manager' :
             location.pathname === '/admin/services' ? 'Service Packages Editor' :
             location.pathname === '/admin/settings' ? 'Admin Portal Settings' : 'Admin Panel'}
          </h1>
          <div className="flex items-center space-x-4">
            <span className="text-sm text-gray-400">Welcome, {user.name}</span>
            <div className="w-8 h-8 rounded-full bg-luxury-gold flex items-center justify-center text-black font-bold">
              {user.name.charAt(0).toUpperCase()}
            </div>
          </div>
        </header>
        
        {/* Scrollable Content */}
        <div className="flex-1 overflow-y-auto p-8">
          <Outlet />
        </div>
      </main>
    </div>
  );
};

export default AdminLayout;
