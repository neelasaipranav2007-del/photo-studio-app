import React, { useState, useEffect, useContext } from 'react';
import { motion } from 'framer-motion';
import { useNavigate } from 'react-router-dom';
import { AuthContext } from '../../context/AuthContext';
import { FiEye, FiEyeOff } from 'react-icons/fi';
import axios from 'axios';

const Login = () => {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [mode, setMode] = useState('login'); // 'login' or 'forgot'
  const [showPassword, setShowPassword] = useState(false);
  const [error, setError] = useState('');
  const [info, setInfo] = useState('');
  const [submitting, setSubmitting] = useState(false);
  const { login } = useContext(AuthContext);
  const navigate = useNavigate();
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
        console.error('Error fetching settings in Login:', err);
      }
    };
    fetchSettings();
  }, []);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setInfo('');
    setSubmitting(true);
    
    if (mode === 'login') {
      const result = await login(email, password);
      setSubmitting(false);
      if (result.success) {
        navigate('/admin');
      } else {
        setError(result.message);
      }
    } else {
      try {
        const { data } = await axios.post('/api/auth/forgot-password', { email });
        setInfo(data.message || 'Temporary password has been sent to your email.');
        setMode('login');
      } catch (err) {
        setError(err.response?.data?.message || 'Password reset request failed.');
      } finally {
        setSubmitting(false);
      }
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center px-6 bg-[#030303]">
      <motion.div 
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="glass p-10 w-full max-w-md border border-white/10"
      >
        <div className="text-center mb-8 flex flex-col items-center justify-center">
          {logoUrl ? (
            <>
              <img src={logoUrl} alt={siteName || 'Studio Logo'} className="max-h-16 max-w-[200px] object-contain mb-4" />
              <h1 className="text-xl font-serif text-white uppercase tracking-widest">
                {mode === 'login' ? 'Admin Access' : 'Recover Access'}
              </h1>
            </>
          ) : (
            <>
              <h1 className="text-3xl font-serif text-white uppercase tracking-widest">
                {mode === 'login' ? 'Admin Access' : 'Recover Access'}
              </h1>
              <div className="w-16 h-1 bg-luxury-gold mx-auto mt-4"></div>
            </>
          )}
        </div>

        {error && (
          <div className="bg-red-500/10 border border-red-500/30 text-red-500 p-4 mb-6 rounded text-sm text-center">
            {error}
          </div>
        )}

        {info && (
          <div className="bg-green-500/10 border border-green-500/30 text-green-400 p-4 mb-6 rounded text-sm text-center">
            {info}
          </div>
        )}

        <form onSubmit={handleSubmit} className="space-y-6">
          <div>
            <label className="block text-xs text-gray-400 mb-2 uppercase tracking-wider">Email Address</label>
            <input 
              type="email" 
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              required 
              className="w-full bg-black/50 border border-white/10 text-white px-4 py-3 focus:outline-none focus:border-luxury-gold transition-colors text-sm rounded" 
            />
          </div>

          {mode === 'login' && (
            <div>
              <div className="flex justify-between items-center mb-2">
                <label className="block text-xs text-gray-400 uppercase tracking-wider">Password</label>
                <button 
                  type="button" 
                  onClick={() => { setMode('forgot'); setError(''); setInfo(''); }}
                  className="text-xs text-luxury-gold hover:underline hover:text-white uppercase tracking-wider"
                >
                  Forgot?
                </button>
              </div>
              <div className="relative">
                <input 
                  type={showPassword ? "text" : "password"} 
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  required={mode === 'login'} 
                  className="w-full bg-black/50 border border-white/10 text-white px-4 py-3 pr-10 focus:outline-none focus:border-luxury-gold transition-colors text-sm rounded" 
                />
                <button 
                  type="button" 
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-luxury-gold"
                >
                  {showPassword ? <FiEyeOff /> : <FiEye />}
                </button>
              </div>
            </div>
          )}

          <button 
            type="submit" 
            disabled={submitting}
            className="w-full py-4 bg-luxury-gold text-black font-bold uppercase tracking-widest hover:bg-white transition-colors rounded text-sm"
          >
            {submitting ? 'Authenticating...' : mode === 'login' ? 'Secure Login' : 'Send Temp Password'}
          </button>

          {mode === 'forgot' && (
            <div className="text-center mt-4">
              <button 
                type="button" 
                onClick={() => { setMode('login'); setError(''); setInfo(''); }}
                className="text-xs text-gray-400 hover:text-white hover:underline uppercase tracking-widest"
              >
                Back to Login
              </button>
            </div>
          )}
        </form>
      </motion.div>
    </div>
  );
};

export default Login;
