import React, { useContext, useState } from 'react';
import { Link } from 'react-router-dom';
import { motion } from 'framer-motion';
import { CartContext } from '../context/CartContext';
import { FiTrash2 } from 'react-icons/fi';
import axios from 'axios';

const Booking = () => {
  const { cart, removeFromCart, clearCart, totalPrice } = useContext(CartContext);
  const [formData, setFormData] = useState({
    customerName: '',
    email: '',
    phone: '',
    eventDate: '',
    eventTime: '',
    eventLocation: '',
    guestCount: '',
    specialRequirements: '',
    eventType: 'Wedding',
    budgetRange: '',
    neededImprovements: ''
  });
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isSuccess, setIsSuccess] = useState(false);
  const [bookingRef, setBookingRef] = useState('');
  
  // Manage Booking State
  const [activeTab, setActiveTab] = useState('book'); // 'book' or 'manage'
  const [cancelRef, setCancelRef] = useState('');
  const [isCancelling, setIsCancelling] = useState(false);
  const [cancelStatus, setCancelStatus] = useState({ success: false, message: '' });

  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setIsSubmitting(true);
    
    try {
      const mappedServices = cart.map(item => {
        // Fallback for mock integer IDs
        if (item._id && item._id.length < 24) {
          const mapping = {
            '1': '60d5ec49b1a53b2d1c67d3e1',
            '2': '60d5ec49b1a53b2d1c67d3e2',
            '3': '60d5ec49b1a53b2d1c67d3e3',
            '4': '60d5ec49b1a53b2d1c67d3e4',
            '5': '60d5ec49b1a53b2d1c67d3e5',
            '6': '60d5ec49b1a53b2d1c67d3e6',
          };
          return mapping[item._id] || item._id;
        }
        return item._id;
      });

      const payload = {
        ...formData,
        eventType: 'Photography Booking',
        services: mappedServices,
        totalPrice: totalPrice
      };
      
      const { data } = await axios.post('/api/bookings', payload);
      setBookingRef(data.referenceNumber);
      
      // Clear the selected services cart when booking is done
      clearCart();
      
      setIsSubmitting(false);
      setIsSuccess(true);
      window.scrollTo({ top: 0, behavior: 'smooth' });
    } catch (error) {
      setIsSubmitting(false);
      alert('There was an error processing your booking. Please try again.');
      console.error(error);
    }
  };

  const handleCancelSubmit = async (e) => {
    e.preventDefault();
    if (!cancelRef.trim()) return;
    
    setIsCancelling(true);
    setCancelStatus({ success: false, message: '' });
    
    try {
      const { data } = await axios.put(`/api/bookings/cancel-by-ref/${cancelRef.trim()}`);
      setCancelStatus({ 
        success: true, 
        message: 'Your booking inquiry has been successfully cancelled.' 
      });
      setCancelRef('');
    } catch (error) {
      setCancelStatus({ 
        success: false, 
        message: error.response?.data?.message || 'Error cancelling booking. Please check your reference number.' 
      });
    } finally {
      setIsCancelling(false);
    }
  };

  return (
    <div>
      {/* Hero Banner */}
      <div className="relative h-80 w-full mb-12">
        <img src="https://images.unsplash.com/photo-1511285560929-80b456fea0bc?q=80&w=2069&auto=format&fit=crop" alt="Booking Banner" className="w-full h-full object-cover" />
        <div className="absolute inset-0 bg-black/60 flex items-center justify-center mt-16">
          <motion.h1 
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="text-4xl md:text-5xl font-serif text-white uppercase tracking-widest text-center px-4"
          >
            Complete <span className="text-luxury-gold">Booking</span>
          </motion.h1>
        </div>
      </div>

      <div className="pb-20 min-h-screen px-6">
        <div className="container mx-auto">
        
        {/* Tabs */}
        <div className="flex justify-center mb-12">
          <div className="flex bg-black/50 p-1 border border-white/10 rounded-full">
            <button
              onClick={() => setActiveTab('book')}
              className={`px-8 py-3 rounded-full text-sm font-bold uppercase tracking-wider transition-colors ${
                activeTab === 'book' ? 'bg-luxury-gold text-black' : 'text-gray-400 hover:text-white'
              }`}
            >
              New Booking
            </button>
            <button
              onClick={() => setActiveTab('manage')}
              className={`px-8 py-3 rounded-full text-sm font-bold uppercase tracking-wider transition-colors ${
                activeTab === 'manage' ? 'bg-luxury-gold text-black' : 'text-gray-400 hover:text-white'
              }`}
            >
              Manage Booking
            </button>
          </div>
        </div>

        {activeTab === 'book' ? (
          <div className="flex flex-col lg:flex-row gap-12">
            {/* Booking Form */}
          <motion.div 
            initial={{ opacity: 0, x: -30 }}
            animate={{ opacity: 1, x: 0 }}
            className="lg:w-2/3 glass p-8 relative"
          >
            {isSuccess ? (
              <div className="text-center py-20">
                <motion.div 
                  initial={{ scale: 0 }} 
                  animate={{ scale: 1 }} 
                  className="w-24 h-24 bg-green-500/20 text-green-400 rounded-full flex items-center justify-center mx-auto mb-6 border border-green-500/50"
                >
                  <svg className="w-12 h-12" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M5 13l4 4L19 7"></path></svg>
                </motion.div>
                <h2 className="text-3xl font-serif text-white mb-4 uppercase tracking-wider">Booking Confirmed!</h2>
                <p className="text-gray-400 mb-8 text-lg">Thank you, {formData.customerName}. Your booking inquiry has been successfully submitted. We have sent a confirmation email to {formData.email}.</p>
                <p className="text-luxury-gold">Reference Number: {bookingRef}</p>
              </div>
            ) : (
              <>
                <h2 className="text-2xl font-serif text-white mb-6 uppercase tracking-wider">Your Details</h2>
                <form onSubmit={handleSubmit} className="space-y-6">
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <div>
                      <label className="block text-sm text-gray-400 mb-2 uppercase tracking-wider">Full Name</label>
                      <input type="text" name="customerName" required onChange={handleChange} className="w-full bg-black/50 border border-white/10 text-white px-4 py-3 focus:outline-none focus:border-luxury-gold transition-colors" />
                    </div>
                    <div>
                      <label className="block text-sm text-gray-400 mb-2 uppercase tracking-wider">Email Address</label>
                      <input type="email" name="email" required onChange={handleChange} className="w-full bg-black/50 border border-white/10 text-white px-4 py-3 focus:outline-none focus:border-luxury-gold transition-colors" />
                    </div>
                    <div>
                      <label className="block text-sm text-gray-400 mb-2 uppercase tracking-wider">Phone Number</label>
                      <input type="tel" name="phone" required onChange={handleChange} className="w-full bg-black/50 border border-white/10 text-white px-4 py-3 focus:outline-none focus:border-luxury-gold transition-colors" />
                    </div>
                    <div>
                      <label className="block text-sm text-gray-400 mb-2 uppercase tracking-wider">Event Date</label>
                      <input type="date" name="eventDate" required onChange={handleChange} className="w-full bg-black/50 border border-white/10 text-white px-4 py-3 focus:outline-none focus:border-luxury-gold transition-colors [color-scheme:dark]" />
                    </div>
                    <div>
                      <label className="block text-sm text-gray-400 mb-2 uppercase tracking-wider">Event Time</label>
                      <input type="time" name="eventTime" required onChange={handleChange} className="w-full bg-black/50 border border-white/10 text-white px-4 py-3 focus:outline-none focus:border-luxury-gold transition-colors [color-scheme:dark]" />
                    </div>
                    <div>
                      <label className="block text-sm text-gray-400 mb-2 uppercase tracking-wider">Guest Count</label>
                      <input type="number" name="guestCount" onChange={handleChange} className="w-full bg-black/50 border border-white/10 text-white px-4 py-3 focus:outline-none focus:border-luxury-gold transition-colors" />
                    </div>
                    <div>
                      <label className="block text-sm text-gray-400 mb-2 uppercase tracking-wider">Event Type</label>
                      <select name="eventType" onChange={handleChange} className="w-full bg-black/50 border border-white/10 text-white px-4 py-3 focus:outline-none focus:border-luxury-gold transition-colors appearance-none">
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
                      <label className="block text-sm text-gray-400 mb-2 uppercase tracking-wider">Budget Range</label>
                      <select name="budgetRange" onChange={handleChange} className="w-full bg-black/50 border border-white/10 text-white px-4 py-3 focus:outline-none focus:border-luxury-gold transition-colors appearance-none">
                        <option value="">Select Budget (Optional)</option>
                        <option value="Under ₹50,000">Under ₹50,000</option>
                        <option value="₹50,000 - ₹1,00,000">₹50,000 - ₹1,00,000</option>
                        <option value="₹1,00,000 - ₹2,00,000">₹1,00,000 - ₹2,00,000</option>
                        <option value="Above ₹2,00,000">Above ₹2,00,000</option>
                      </select>
                    </div>
                  </div>
                  <div>
                    <label className="block text-sm text-gray-400 mb-2 uppercase tracking-wider">Event Location / Venue</label>
                    <input type="text" name="eventLocation" required placeholder="E.g. Taj Hotel, Mumbai" onChange={handleChange} className="w-full bg-black/50 border border-white/10 text-white px-4 py-3 mb-6 focus:outline-none focus:border-luxury-gold transition-colors" />
                    
                    <textarea name="specialRequirements" rows="4" placeholder="Tell us more about your occasion and specific photography expectations..." onChange={handleChange} className="w-full bg-black/50 border border-white/10 text-white px-4 py-3 mb-6 focus:outline-none focus:border-luxury-gold transition-colors"></textarea>
                    
                    <label className="block text-sm text-gray-400 mb-2 uppercase tracking-wider">Needed any improvement by the photo studio?</label>
                    <textarea name="neededImprovements" rows="3" placeholder="Do you have any suggestions or feedback for us?" onChange={handleChange} className="w-full bg-black/50 border border-white/10 text-white px-4 py-3 focus:outline-none focus:border-luxury-gold transition-colors"></textarea>
                  </div>
                  <button 
                    type="submit" 
                    disabled={isSubmitting || cart.length === 0}
                    className={`w-full py-4 font-bold uppercase tracking-widest transition-colors ${
                      isSubmitting || cart.length === 0 ? 'bg-gray-600 text-gray-400 cursor-not-allowed' : 'bg-luxury-gold text-black hover:bg-white'
                    }`}
                  >
                    {isSubmitting ? 'Processing...' : 'Confirm Booking'}
                  </button>
                </form>
              </>
            )}
          </motion.div>

          {/* Cart Summary */}
          <motion.div 
            initial={{ opacity: 0, x: 30 }}
            animate={{ opacity: 1, x: 0 }}
            className="lg:w-1/3"
          >
            <div className="glass p-8 sticky top-32">
              <h2 className="text-2xl font-serif text-white mb-6 uppercase tracking-wider">Selected Services</h2>
              
              {cart.length === 0 ? (
                <div className="space-y-6">
                  <p className="text-gray-400">Your cart is empty. Please select a service first.</p>
                  <Link 
                    to="/services" 
                    className="inline-block w-full text-center py-3 bg-luxury-gold text-black font-bold uppercase tracking-widest hover:bg-white transition-colors text-sm"
                  >
                    Explore Now
                  </Link>
                </div>
              ) : (
                <div className="space-y-6">
                  {cart.map(item => (
                    <div key={item._id} className="flex justify-between items-start border-b border-white/10 pb-4">
                      <div>
                        <h3 className="text-white mb-1">{item.title}</h3>
                        <p className="text-luxury-gold">₹{item.price.toLocaleString('en-IN')}</p>
                      </div>
                      <button onClick={() => removeFromCart(item._id)} className="text-red-400 hover:text-red-300 mt-1">
                        <FiTrash2 />
                      </button>
                    </div>
                  ))}
                  
                  <div className="pt-4 flex justify-between items-center text-xl">
                    <span className="text-white font-serif uppercase tracking-widest">Total</span>
                    <span className="text-luxury-gold font-bold">₹{totalPrice.toLocaleString('en-IN')}</span>
                  </div>
                </div>
              )}
            </div>
          </motion.div>
        </div>
        ) : (
          <motion.div 
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="max-w-2xl mx-auto glass p-8"
          >
            <h2 className="text-2xl font-serif text-white mb-2 uppercase tracking-wider text-center">Cancel Booking</h2>
            <p className="text-gray-400 text-center mb-8">Enter your reference number below to cancel an existing booking inquiry.</p>
            
            {cancelStatus.message && (
              <div className={`p-4 mb-6 text-center border ${cancelStatus.success ? 'bg-green-500/20 border-green-500/50 text-green-400' : 'bg-red-500/20 border-red-500/50 text-red-400'}`}>
                {cancelStatus.message}
              </div>
            )}

            <form onSubmit={handleCancelSubmit} className="space-y-6">
              <div>
                <label className="block text-sm text-gray-400 mb-2 uppercase tracking-wider text-center">Reference Number</label>
                <input 
                  type="text" 
                  value={cancelRef}
                  onChange={(e) => setCancelRef(e.target.value)}
                  placeholder="e.g. JON-1234" 
                  required 
                  className="w-full bg-black/50 border border-white/10 text-white px-4 py-3 text-center focus:outline-none focus:border-luxury-gold transition-colors text-lg tracking-widest" 
                />
              </div>
              <button 
                type="submit" 
                disabled={isCancelling || !cancelRef.trim()}
                className={`w-full py-4 font-bold uppercase tracking-widest transition-colors ${
                  isCancelling || !cancelRef.trim() ? 'bg-gray-600 text-gray-400 cursor-not-allowed' : 'bg-red-500 text-white hover:bg-red-600'
                }`}
              >
                {isCancelling ? 'Processing...' : 'Cancel Booking'}
              </button>
            </form>
          </motion.div>
        )}
        
      </div>
    </div>
    </div>
  );
};

export default Booking;
