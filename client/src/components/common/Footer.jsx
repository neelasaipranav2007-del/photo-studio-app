import React, { useState, useEffect } from 'react';
import axios from 'axios';

const Footer = () => {
  const [settings, setSettings] = useState({
    siteName: 'JonathanPortfolio',
    logoUrl: '',
    socialLinks: {
      instagram: '#',
      facebook: '#',
      twitter: '#'
    }
  });

  useEffect(() => {
    const fetchSettings = async () => {
      try {
        const { data } = await axios.get('/api/settings');
        if (data) {
          setSettings({
            siteName: data.siteName || 'JonathanPortfolio',
            logoUrl: data.logoUrl || '',
            socialLinks: {
              instagram: data.socialLinks?.instagram || '#',
              facebook: data.socialLinks?.facebook || '#',
              twitter: data.socialLinks?.twitter || '#'
            }
          });
        }
      } catch (err) {
        console.error('Error fetching settings in Footer:', err);
      }
    };
    fetchSettings();
  }, []);

  const renderLogo = () => {
    if (settings.logoUrl) {
      return <img src={settings.logoUrl} alt={settings.siteName} className="h-10 object-contain mx-auto" />;
    }
    const name = settings.siteName;
    if (name.toLowerCase().endsWith('portfolio')) {
      const main = name.substring(0, name.toLowerCase().lastIndexOf('portfolio'));
      return <>{main}<span className="text-luxury-gold">Portfolio</span></>;
    } else if (name.toLowerCase().endsWith('photography')) {
      const main = name.substring(0, name.toLowerCase().lastIndexOf('photography'));
      return <>{main}<span className="text-luxury-gold">Photography</span></>;
    }
    return name;
  };

  return (
    <footer className="bg-black py-12 border-t border-white/10">
      <div className="container mx-auto px-6 text-center">
        <h2 className="text-2xl font-serif tracking-widest text-white uppercase mb-6">
          {renderLogo()}
        </h2>
        <p className="text-luxury-muted mb-8 max-w-md mx-auto font-light">
          Elevating your moments into timeless visual stories with a touch of luxury and elegance.
        </p>
        <div className="flex justify-center space-x-6 text-sm text-luxury-muted mb-8">
          <a href={settings.socialLinks.instagram} target="_blank" rel="noopener noreferrer" className="hover:text-luxury-gold transition-colors">Instagram</a>
          <a href={settings.socialLinks.facebook} target="_blank" rel="noopener noreferrer" className="hover:text-luxury-gold transition-colors">Facebook</a>
          <a href={settings.socialLinks.twitter} target="_blank" rel="noopener noreferrer" className="hover:text-luxury-gold transition-colors">Twitter</a>
        </div>
        <p className="text-xs text-white/30 uppercase tracking-widest">
          &copy; {new Date().getFullYear()} {settings.siteName}. All rights reserved.
        </p>
      </div>
    </footer>
  );
};

export default Footer;
