import React, { useState, useEffect, useContext } from 'react';
import { motion } from 'framer-motion';
import { FiSave, FiLock, FiSettings, FiUploadCloud, FiEye, FiEyeOff } from 'react-icons/fi';
import axios from 'axios';
import { AuthContext } from '../../context/AuthContext';

const Settings = () => {
  const { user } = useContext(AuthContext);
  const [loading, setLoading] = useState(true);

  // Settings fields
  const [siteName, setSiteName] = useState('');
  const [logoUrl, setLogoUrl] = useState('');
  const [contactEmail, setContactEmail] = useState('');
  const [contactPhone, setContactPhone] = useState('');
  const [contactWhatsapp, setContactWhatsapp] = useState('');
  const [notificationEmail, setNotificationEmail] = useState('');
  const [websiteTheme, setWebsiteTheme] = useState('luxury-gold');
  const [address, setAddress] = useState('');
  
  const [instagram, setInstagram] = useState('');
  const [facebook, setFacebook] = useState('');
  const [twitter, setTwitter] = useState('');

  // Password fields
  const [oldPassword, setOldPassword] = useState('');
  const [newPassword, setNewPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  
  const [showOldPassword, setShowOldPassword] = useState(false);
  const [showNewPassword, setShowNewPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);

  const [savingSettings, setSavingSettings] = useState(false);
  const [changingPassword, setChangingPassword] = useState(false);
  const [uploadingLogo, setUploadingLogo] = useState(false);

  const fetchSettings = async () => {
    try {
      const { data } = await axios.get('/api/settings');
      setSiteName(data.siteName || '');
      setLogoUrl(data.logoUrl || '');
      setContactEmail(data.contactEmail || '');
      setContactPhone(data.contactPhone || '');
      setContactWhatsapp(data.contactWhatsapp || '');
      setNotificationEmail(data.notificationEmail || '');
      setWebsiteTheme(data.websiteTheme || 'luxury-gold');
      setAddress(data.address || '');
      
      setInstagram(data.socialLinks?.instagram || '');
      setFacebook(data.socialLinks?.facebook || '');
      setTwitter(data.socialLinks?.twitter || '');
      
      setLoading(false);
    } catch (err) {
      console.error('Error fetching settings', err);
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchSettings();
  }, []);

  const handleLogoUpload = async (e) => {
    const file = e.target.files[0];
    if (!file) return;

    setUploadingLogo(true);
    const formData = new FormData();
    formData.append('image', file);

    try {
      const config = {
        headers: {
          'Content-Type': 'multipart/form-data',
          Authorization: `Bearer ${user?.token}`
        }
      };
      const { data } = await axios.post('/api/upload', formData, config);
      setLogoUrl(data.url);
      setUploadingLogo(false);
      alert('Logo uploaded successfully! Click Save Settings to persist.');
    } catch (err) {
      console.error(err);
      alert('Logo upload failed.');
      setUploadingLogo(false);
    }
  };

  const handleSaveSettings = async (e) => {
    e.preventDefault();
    setSavingSettings(true);

    const payload = {
      siteName,
      logoUrl,
      contactEmail,
      contactPhone,
      contactWhatsapp,
      notificationEmail,
      websiteTheme,
      address,
      socialLinks: {
        instagram,
        facebook,
        twitter
      }
    };

    try {
      const config = { headers: { Authorization: `Bearer ${user?.token}` } };
      await axios.put('/api/settings', payload, config);
      alert('Settings updated successfully!');
    } catch (err) {
      console.error(err);
      alert('Failed to update settings.');
    } finally {
      setSavingSettings(false);
    }
  };

  const handleChangePassword = async (e) => {
    e.preventDefault();
    if (newPassword !== confirmPassword) {
      alert('New passwords do not match.');
      return;
    }

    setChangingPassword(true);

    try {
      const config = { headers: { Authorization: `Bearer ${user?.token}` } };
      await axios.put('/api/auth/change-password', {
        oldPassword,
        newPassword
      }, config);
      
      alert('Password updated successfully!');
      setOldPassword('');
      setNewPassword('');
      setConfirmPassword('');
    } catch (err) {
      alert(err.response?.data?.message || 'Failed to change password');
    } finally {
      setChangingPassword(false);
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64 text-luxury-gold">
        <div className="text-lg tracking-widest font-serif animate-pulse">Loading Settings Panel...</div>
      </div>
    );
  }

  return (
    <div className="space-y-10 pb-12">
      <div>
        <h2 className="text-2xl font-serif text-white mb-2 tracking-wide">Studio Settings</h2>
        <p className="text-sm text-gray-400">Configure your business details, branding, links, and passwords</p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        
        {/* Studio Info Panel */}
        <div className="lg:col-span-2 glass border border-white/10 p-6 rounded-lg space-y-6">
          <h3 className="text-lg font-serif text-white tracking-widest uppercase flex items-center">
            <FiSettings className="mr-2 text-luxury-gold" /> Studio Configuration
          </h3>
          <form onSubmit={handleSaveSettings} className="space-y-4">
            
            {/* Logo Upload */}
            <div className="flex items-center space-x-6 bg-black/40 border border-white/5 p-4 rounded-lg">
              <div className="h-16 w-16 bg-white/5 border border-white/15 rounded flex items-center justify-center overflow-hidden">
                {logoUrl ? (
                  <img src={logoUrl} alt="Logo Preview" className="h-full w-full object-contain" />
                ) : (
                  <span className="text-[10px] text-gray-500 uppercase tracking-wider text-center">No Logo</span>
                )}
              </div>
              <div>
                <input 
                  type="file" 
                  accept="image/*" 
                  onChange={handleLogoUpload} 
                  id="logo-upload" 
                  className="hidden" 
                />
                <div className="flex items-center space-x-2">
                  <label htmlFor="logo-upload" className="cursor-pointer flex items-center space-x-2 bg-luxury-gold/20 hover:bg-luxury-gold border border-luxury-gold/40 text-luxury-gold hover:text-black px-4 py-2 rounded text-xs font-bold uppercase transition-all whitespace-nowrap">
                    <FiUploadCloud />
                    <span>{uploadingLogo ? 'Uploading...' : 'Upload Logo'}</span>
                  </label>
                  {logoUrl && (
                    <button 
                      type="button"
                      onClick={() => setLogoUrl('')}
                      className="flex items-center space-x-2 bg-red-950/20 hover:bg-red-600 border border-red-500/20 hover:border-red-500 text-red-400 hover:text-white px-4 py-2 rounded text-xs font-bold uppercase transition-all whitespace-nowrap"
                    >
                      Remove Logo
                    </button>
                  )}
                </div>
                <input 
                  type="text" 
                  value={logoUrl}
                  onChange={(e) => setLogoUrl(e.target.value)}
                  placeholder="Or enter logo URL"
                  className="mt-2 w-full bg-black/50 border border-white/10 text-white px-3 py-1.5 rounded focus:outline-none focus:border-luxury-gold text-xs"
                />
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="block text-xs text-gray-400 mb-2 uppercase tracking-wider">Studio / Website Name</label>
                <input 
                  type="text" 
                  value={siteName}
                  onChange={(e) => setSiteName(e.target.value)}
                  required
                  className="w-full bg-black/50 border border-white/10 text-white px-4 py-2.5 rounded focus:outline-none focus:border-luxury-gold text-sm" 
                />
              </div>
              <div>
                <label className="block text-xs text-gray-400 mb-2 uppercase tracking-wider">Booking Accents Theme</label>
                <select 
                  value={websiteTheme}
                  onChange={(e) => setWebsiteTheme(e.target.value)}
                  className="w-full bg-black/50 border border-white/10 text-white px-4 py-2.5 rounded focus:outline-none focus:border-luxury-gold text-sm appearance-none"
                >
                  <option value="luxury-gold">Luxury Gold & Black</option>
                  <option value="minimalist-silver">Minimalist Silver & Dark</option>
                  <option value="warm-bronze">Warm Bronze</option>
                </select>
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <div>
                <label className="block text-xs text-gray-400 mb-2 uppercase tracking-wider">Contact Email</label>
                <input 
                  type="email" 
                  value={contactEmail}
                  onChange={(e) => setContactEmail(e.target.value)}
                  required
                  className="w-full bg-black/50 border border-white/10 text-white px-4 py-2.5 rounded focus:outline-none focus:border-luxury-gold text-sm" 
                />
              </div>
              <div>
                <label className="block text-xs text-gray-400 mb-2 uppercase tracking-wider">Contact Phone</label>
                <input 
                  type="text" 
                  value={contactPhone}
                  onChange={(e) => setContactPhone(e.target.value)}
                  required
                  className="w-full bg-black/50 border border-white/10 text-white px-4 py-2.5 rounded focus:outline-none focus:border-luxury-gold text-sm" 
                />
              </div>
              <div>
                <label className="block text-xs text-gray-400 mb-2 uppercase tracking-wider">WhatsApp Number</label>
                <input 
                  type="text" 
                  value={contactWhatsapp}
                  onChange={(e) => setContactWhatsapp(e.target.value)}
                  className="w-full bg-black/50 border border-white/10 text-white px-4 py-2.5 rounded focus:outline-none focus:border-luxury-gold text-sm" 
                />
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="block text-xs text-gray-400 mb-2 uppercase tracking-wider">Booking Notification Email</label>
                <input 
                  type="email" 
                  value={notificationEmail}
                  onChange={(e) => setNotificationEmail(e.target.value)}
                  required
                  className="w-full bg-black/50 border border-white/10 text-white px-4 py-2.5 rounded focus:outline-none focus:border-luxury-gold text-sm" 
                />
              </div>
              <div>
                <label className="block text-xs text-gray-400 mb-2 uppercase tracking-wider">Physical Studio Address</label>
                <input 
                  type="text" 
                  value={address}
                  onChange={(e) => setAddress(e.target.value)}
                  className="w-full bg-black/50 border border-white/10 text-white px-4 py-2.5 rounded focus:outline-none focus:border-luxury-gold text-sm" 
                />
              </div>
            </div>

            <div className="space-y-3 pt-2">
              <h4 className="text-xs uppercase tracking-widest text-gray-500 font-mono">Social Media Integration</h4>
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <div>
                  <label className="block text-[10px] text-gray-400 mb-1 uppercase tracking-wider">Instagram URL</label>
                  <input type="text" value={instagram} onChange={(e) => setInstagram(e.target.value)} placeholder="https://instagram.com/..." className="w-full bg-black/40 border border-white/10 text-white px-3 py-2 rounded focus:outline-none text-xs" />
                </div>
                <div>
                  <label className="block text-[10px] text-gray-400 mb-1 uppercase tracking-wider">Facebook URL</label>
                  <input type="text" value={facebook} onChange={(e) => setFacebook(e.target.value)} placeholder="https://facebook.com/..." className="w-full bg-black/40 border border-white/10 text-white px-3 py-2 rounded focus:outline-none text-xs" />
                </div>
                <div>
                  <label className="block text-[10px] text-gray-400 mb-1 uppercase tracking-wider">Twitter/X URL</label>
                  <input type="text" value={twitter} onChange={(e) => setTwitter(e.target.value)} placeholder="https://twitter.com/..." className="w-full bg-black/40 border border-white/10 text-white px-3 py-2 rounded focus:outline-none text-xs" />
                </div>
              </div>
            </div>

            <button 
              type="submit" 
              disabled={savingSettings}
              className="w-full py-3 bg-luxury-gold text-black font-bold uppercase tracking-widest hover:bg-white transition-colors text-sm flex items-center justify-center space-x-2"
            >
              <FiSave />
              <span>{savingSettings ? 'Saving...' : 'Save Settings'}</span>
            </button>
          </form>
        </div>

        {/* Change Password Panel */}
        <div className="glass border border-white/10 p-6 rounded-lg space-y-6 self-start">
          <h3 className="text-lg font-serif text-white tracking-widest uppercase flex items-center">
            <FiLock className="mr-2 text-luxury-gold" /> Security Portal
          </h3>
          <form onSubmit={handleChangePassword} className="space-y-4">
            <div>
              <label className="block text-xs text-gray-400 mb-2 uppercase tracking-wider">Current Password</label>
              <div className="relative">
                <input 
                  type={showOldPassword ? "text" : "password"} 
                  value={oldPassword}
                  onChange={(e) => setOldPassword(e.target.value)}
                  required
                  className="w-full bg-black/50 border border-white/10 text-white px-4 py-2.5 pr-10 rounded focus:outline-none focus:border-luxury-gold text-sm" 
                />
                <button 
                  type="button" 
                  onClick={() => setShowOldPassword(!showOldPassword)}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-luxury-gold"
                >
                  {showOldPassword ? <FiEyeOff /> : <FiEye />}
                </button>
              </div>
            </div>
            <div>
              <label className="block text-xs text-gray-400 mb-2 uppercase tracking-wider">New Password</label>
              <div className="relative">
                <input 
                  type={showNewPassword ? "text" : "password"} 
                  value={newPassword}
                  onChange={(e) => setNewPassword(e.target.value)}
                  required
                  className="w-full bg-black/50 border border-white/10 text-white px-4 py-2.5 pr-10 rounded focus:outline-none focus:border-luxury-gold text-sm" 
                />
                <button 
                  type="button" 
                  onClick={() => setShowNewPassword(!showNewPassword)}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-luxury-gold"
                >
                  {showNewPassword ? <FiEyeOff /> : <FiEye />}
                </button>
              </div>
            </div>
            <div>
              <label className="block text-xs text-gray-400 mb-2 uppercase tracking-wider">Confirm New Password</label>
              <div className="relative">
                <input 
                  type={showConfirmPassword ? "text" : "password"} 
                  value={confirmPassword}
                  onChange={(e) => setConfirmPassword(e.target.value)}
                  required
                  className="w-full bg-black/50 border border-white/10 text-white px-4 py-2.5 pr-10 rounded focus:outline-none focus:border-luxury-gold text-sm" 
                />
                <button 
                  type="button" 
                  onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-luxury-gold"
                >
                  {showConfirmPassword ? <FiEyeOff /> : <FiEye />}
                </button>
              </div>
            </div>
            <button 
              type="submit" 
              disabled={changingPassword}
              className="w-full py-3 bg-luxury-gold text-black font-bold uppercase tracking-widest hover:bg-white transition-colors text-sm"
            >
              {changingPassword ? 'Updating...' : 'Change Password'}
            </button>
          </form>
        </div>

      </div>
    </div>
  );
};

export default Settings;
