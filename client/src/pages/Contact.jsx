import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { FiMapPin, FiMail, FiPhone, FiInstagram, FiFacebook, FiTwitter } from 'react-icons/fi';
import axios from 'axios';

const Contact = () => {
  const [settings, setSettings] = useState({
    address: '123 Luxury Avenue, Beverly Hills, CA 90210',
    contactEmail: 'hello@jonathanportfolio.com',
    contactPhone: '+1 (555) 123-4567',
    socialLinks: {
      instagram: '#',
      facebook: '#',
      twitter: '#'
    }
  });

  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [eventType, setEventType] = useState('General Inquiry');
  const [query, setQuery] = useState('');
  const [neededImprovements, setNeededImprovements] = useState('');
  const [loading, setLoading] = useState(false);
  const [success, setSuccess] = useState('');
  const [error, setError] = useState('');

  useEffect(() => {
    const fetchSettings = async () => {
      try {
        const { data } = await axios.get('/api/settings');
        if (data) {
          setSettings({
            address: data.address || '123 Luxury Avenue, Beverly Hills, CA 90210',
            contactEmail: data.contactEmail || 'hello@jonathanportfolio.com',
            contactPhone: data.contactPhone || '+1 (555) 123-4567',
            socialLinks: {
              instagram: data.socialLinks?.instagram || '#',
              facebook: data.socialLinks?.facebook || '#',
              twitter: data.socialLinks?.twitter || '#'
            }
          });
        }
      } catch (err) {
        console.error('Error fetching settings on Contact page:', err);
      }
    };
    fetchSettings();
  }, []);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setSuccess('');
    setError('');

    try {
      const payload = {
        customerName: name,
        email: email,
        phone: 'N/A',
        eventDate: new Date().toISOString().split('T')[0],
        eventTime: '00:00',
        eventLocation: 'Contact Form Message',
        eventType: eventType,
        specialRequirements: query,
        neededImprovements: neededImprovements,
        isContactQuery: true,
        totalPrice: 0,
        services: []
      };

      await axios.post('/api/bookings', payload);
      setSuccess('Your message has been sent successfully. We will get back to you soon!');
      setName('');
      setEmail('');
      setEventType('General Inquiry');
      setQuery('');
      setNeededImprovements('');
    } catch (err) {
      console.error('Error submitting contact form:', err);
      setError(
        err.response?.data?.message || 
        'Something went wrong while sending your message. Please try again.'
      );
    } finally {
      setLoading(false);
    }
  };

  return (
    <div>
      {/* Hero Banner */}
      <div className="relative h-80 w-full mb-12">
        <img src="https://images.unsplash.com/photo-1469334031218-e382a71b716b?q=80&w=2070&auto=format&fit=crop" alt="Contact Banner" className="w-full h-full object-cover" />
        <div className="absolute inset-0 bg-black/60 flex items-center justify-center mt-16">
          <motion.h1 
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="text-4xl md:text-5xl font-serif text-white uppercase tracking-widest text-center px-4"
          >
            Get in <span className="text-luxury-gold">Touch</span>
          </motion.h1>
        </div>
      </div>

      <div className="pb-20 min-h-screen px-6">
        <div className="container mx-auto">

        <div className="grid grid-cols-1 md:grid-cols-2 gap-12">
          {/* Contact Information */}
          <motion.div 
            initial={{ opacity: 0, x: -30 }}
            animate={{ opacity: 1, x: 0 }}
            className="glass p-10 flex flex-col justify-center"
          >
            <h2 className="text-3xl font-serif text-white mb-8">Let's create something beautiful together.</h2>
            
            <div className="space-y-6">
              <div className="flex items-center text-gray-300">
                <FiMapPin className="text-luxury-gold text-2xl mr-4 flex-shrink-0" />
                <span>{settings.address}</span>
              </div>
              <a href={`mailto:${settings.contactEmail}`} className="flex items-center text-gray-300 hover:text-luxury-gold transition-colors">
                <FiMail className="text-luxury-gold text-2xl mr-4 flex-shrink-0" />
                <span>{settings.contactEmail}</span>
              </a>
              <a href={`tel:${settings.contactPhone}`} className="flex items-center text-gray-300 hover:text-luxury-gold transition-colors">
                <FiPhone className="text-luxury-gold text-2xl mr-4 flex-shrink-0" />
                <span>{settings.contactPhone}</span>
              </a>
            </div>

            <div className="mt-12">
              <h3 className="text-sm uppercase tracking-widest text-white/50 mb-4">Follow Us</h3>
              <div className="flex space-x-6 text-2xl">
                <a href={settings.socialLinks.instagram} target="_blank" rel="noopener noreferrer" className="text-gray-400 hover:text-luxury-gold transition-colors"><FiInstagram /></a>
                <a href={settings.socialLinks.facebook} target="_blank" rel="noopener noreferrer" className="text-gray-400 hover:text-luxury-gold transition-colors"><FiFacebook /></a>
                <a href={settings.socialLinks.twitter} target="_blank" rel="noopener noreferrer" className="text-gray-400 hover:text-luxury-gold transition-colors"><FiTwitter /></a>
              </div>
            </div>
          </motion.div>

          {/* Contact Form */}
          <motion.div 
            initial={{ opacity: 0, x: 30 }}
            animate={{ opacity: 1, x: 0 }}
            className="glass p-10"
          >
            {success && (
              <div className="mb-6 p-4 bg-green-500/20 border border-green-500/50 text-green-400 rounded text-sm">
                {success}
              </div>
            )}
            {error && (
              <div className="mb-6 p-4 bg-red-500/20 border border-red-500/50 text-red-400 rounded text-sm">
                {error}
              </div>
            )}
            <form onSubmit={handleSubmit} className="space-y-6">
              <div>
                <label className="block text-sm text-gray-400 mb-2 uppercase tracking-wider">Name</label>
                <input 
                  type="text" 
                  required
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  className="w-full bg-black/50 border border-white/10 text-white px-4 py-3 focus:outline-none focus:border-luxury-gold transition-colors" 
                />
              </div>
              <div>
                <label className="block text-sm text-gray-400 mb-2 uppercase tracking-wider">Email</label>
                <input 
                  type="email" 
                  required
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  className="w-full bg-black/50 border border-white/10 text-white px-4 py-3 focus:outline-none focus:border-luxury-gold transition-colors" 
                />
              </div>
              <div>
                <label className="block text-sm text-gray-400 mb-2 uppercase tracking-wider">Event Name</label>
                <select
                  value={eventType}
                  onChange={(e) => setEventType(e.target.value)}
                  className="w-full bg-black/50 border border-white/10 text-white px-4 py-3 focus:outline-none focus:border-luxury-gold transition-colors appearance-none"
                >
                  <option value="General Inquiry">General Inquiry</option>
                  <option value="Wedding">Wedding</option>
                  <option value="Pre-Wedding">Pre-Wedding</option>
                  <option value="Birthday">Birthday</option>
                  <option value="Maternity">Maternity</option>
                  <option value="Corporate">Corporate</option>
                  <option value="Fashion">Fashion</option>
                  <option value="Custom">Custom / Other</option>
                </select>
              </div>
              <div>
                <label className="block text-sm text-gray-400 mb-2 uppercase tracking-wider">Query</label>
                <textarea 
                  rows="4" 
                  required
                  placeholder="How can we help you?"
                  value={query}
                  onChange={(e) => setQuery(e.target.value)}
                  className="w-full bg-black/50 border border-white/10 text-white px-4 py-3 focus:outline-none focus:border-luxury-gold transition-colors"
                ></textarea>
              </div>
              <div>
                <label className="block text-sm text-gray-400 mb-2 uppercase tracking-wider">Needed any improvement by the photo studio?</label>
                <textarea 
                  rows="3" 
                  placeholder="Do you have any suggestions or feedback for us?"
                  value={neededImprovements}
                  onChange={(e) => setNeededImprovements(e.target.value)}
                  className="w-full bg-black/50 border border-white/10 text-white px-4 py-3 focus:outline-none focus:border-luxury-gold transition-colors"
                ></textarea>
              </div>
              <button 
                type="submit" 
                disabled={loading}
                className="w-full py-4 bg-luxury-gold text-black font-bold uppercase tracking-widest hover:bg-white transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
              >
                {loading ? 'Sending Message...' : 'Send Message'}
              </button>
            </form>
          </motion.div>
        </div>
      </div>
    </div>
    </div>
  );
};

export default Contact;
