import React, { useState, useEffect, useContext } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import { FiShoppingCart } from 'react-icons/fi';
import { CartContext } from '../../context/CartContext';
import axios from 'axios';

const Navbar = () => {
  const [scrolled, setScrolled] = useState(false);
  const [siteName, setSiteName] = useState('JonathanPortfolio');
  const [logoUrl, setLogoUrl] = useState('');
  const { cart } = useContext(CartContext);
  const navigate = useNavigate();

  useEffect(() => {
    const handleScroll = () => {
      setScrolled(window.scrollY > 50);
    };
    window.addEventListener('scroll', handleScroll);

    const fetchSettings = async () => {
      try {
        const { data } = await axios.get('/api/settings');
        if (data) {
          if (data.siteName) setSiteName(data.siteName);
          if (data.logoUrl) setLogoUrl(data.logoUrl);
        }
      } catch (err) {
        console.error('Error fetching settings in Navbar:', err);
      }
    };
    fetchSettings();

    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  const renderLogo = () => {
    if (logoUrl) {
      return <img src={logoUrl} alt={siteName} className="h-8 object-contain" />;
    }
    if (siteName.toLowerCase().endsWith('portfolio')) {
      const main = siteName.substring(0, siteName.toLowerCase().lastIndexOf('portfolio'));
      return <>{main}<span className="text-luxury-gold">Portfolio</span></>;
    } else if (siteName.toLowerCase().endsWith('photography')) {
      const main = siteName.substring(0, siteName.toLowerCase().lastIndexOf('photography'));
      return <>{main}<span className="text-luxury-gold">Photography</span></>;
    }
    return siteName;
  };

  return (
    <motion.nav 
      initial={{ y: -100 }}
      animate={{ y: 0 }}
      transition={{ duration: 0.5 }}
      className={`fixed w-full z-50 transition-all duration-300 ${scrolled ? 'glass py-4' : 'bg-gradient-to-b from-black/80 via-black/40 to-transparent py-6'}`}
    >
      <div className="container mx-auto px-6 flex justify-between items-center">
        <Link to="/" className="text-2xl font-serif tracking-widest text-white uppercase">
          {renderLogo()}
        </Link>
        <div className="hidden md:flex space-x-8 text-sm font-medium tracking-wide uppercase">
          <Link to="/" className="hover:text-luxury-gold transition-colors">Home</Link>
          <Link to="/portfolio" className="hover:text-luxury-gold transition-colors">Portfolio</Link>
          <Link to="/services" className="hover:text-luxury-gold transition-colors">Services</Link>
          <Link to="/contact" className="hover:text-luxury-gold transition-colors">Contact</Link>
        </div>
        <div className="hidden md:flex items-center space-x-6">
          <button 
            onClick={() => navigate('/book')}
            className="relative p-2 text-white hover:text-luxury-gold transition-colors"
          >
            <FiShoppingCart className="text-2xl" />
            {cart.length > 0 && (
              <span className="absolute top-0 right-0 inline-flex items-center justify-center px-2 py-1 text-xs font-bold leading-none text-black transform translate-x-1/2 -translate-y-1/2 bg-luxury-gold rounded-full">
                {cart.length}
              </span>
            )}
          </button>
          <Link to="/book" className="px-6 py-2 border border-luxury-gold text-luxury-gold hover:bg-luxury-gold hover:text-black transition-all duration-300">
            Book Now
          </Link>
        </div>
      </div>
    </motion.nav>
  );
};

export default Navbar;
