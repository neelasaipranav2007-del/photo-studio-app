import React, { useContext, useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { CartContext } from '../context/CartContext';
import axios from 'axios';

const Services = () => {
  const { cart, addToCart, removeFromCart } = useContext(CartContext);
  const [services, setServices] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchServices = async () => {
      try {
        const { data } = await axios.get('/api/services');
        setServices(data);
        setLoading(false);
      } catch (err) {
        console.error('Error fetching services', err);
        setLoading(false);
      }
    };
    fetchServices();
  }, []);

  const isInCart = (id) => cart.some(item => item._id === id);

  if (loading) {
    return (
      <div className="min-h-screen bg-black flex items-center justify-center text-luxury-gold pt-20">
        <div className="text-xl tracking-widest font-serif animate-pulse">Loading Services...</div>
      </div>
    );
  }

  return (
    <div className="pt-32 pb-20 min-h-screen px-6 bg-black">
      <div className="container mx-auto">
        <div className="text-center mb-16">
          <motion.h1 
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="text-4xl md:text-5xl font-serif text-white mb-4 uppercase tracking-widest"
          >
            Our <span className="text-luxury-gold">Services</span>
          </motion.h1>
          <div className="w-24 h-1 bg-luxury-gold mx-auto mb-8"></div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
          {services.map((service, index) => (
            <motion.div 
              key={service._id}
              initial={{ opacity: 0, y: 30 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: index * 0.1 }}
              className="glass relative overflow-hidden group flex flex-col rounded-xl border border-white/10"
            >
              <div className="h-56 w-full overflow-hidden">
                 <img src={service.imageUrl} alt={service.title} className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-700" />
              </div>
              <div className="p-8 flex flex-col flex-1">
                <div className="absolute top-56 right-0 w-20 h-20 bg-luxury-gold/10 rounded-bl-full -z-10 group-hover:scale-150 transition-transform duration-500"></div>
              
              <h2 className="text-2xl font-serif text-white mb-2">{service.title}</h2>
              <p className="text-luxury-gold text-3xl font-light mb-4">₹{service.price.toLocaleString('en-IN')}</p>
              <p className="text-gray-400 mb-6 font-light flex-1">{service.description}</p>
              
              <div className="mb-8">
                <h3 className="text-sm uppercase tracking-wider text-white/70 mb-3">Deliverables:</h3>
                <ul className="space-y-2">
                  {service.deliverables.map((item, i) => (
                    <li key={i} className="text-sm text-gray-300 flex items-center">
                      <span className="w-1.5 h-1.5 bg-luxury-gold rounded-full mr-2"></span>
                      {item}
                    </li>
                  ))}
                </ul>
              </div>

              <button 
                onClick={() => isInCart(service._id) ? removeFromCart(service._id) : addToCart(service)}
                className={`w-full py-3 font-semibold uppercase tracking-widest transition-colors ${
                  isInCart(service._id) 
                    ? 'bg-white text-black' 
                    : 'bg-transparent border border-luxury-gold text-luxury-gold hover:bg-luxury-gold hover:text-black'
                }`}
              >
                {isInCart(service._id) ? 'Remove' : 'Add to Package'}
              </button>
            </div>
            </motion.div>
          ))}
        </div>

        {services.length === 0 && (
          <div className="text-center py-20 text-gray-500">
            No services currently available.
          </div>
        )}
      </div>
    </div>
  );
};

export default Services;
