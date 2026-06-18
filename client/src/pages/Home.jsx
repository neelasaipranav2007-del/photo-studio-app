import React from 'react';
import { motion } from 'framer-motion';
import { Link } from 'react-router-dom';

const Home = () => {
  return (
    <div>
      {/* Hero Section */}
      <section className="relative h-screen flex items-center justify-center overflow-hidden">
        <div className="absolute inset-0 z-0">
          {/* We will use a placeholder image for now, later we can use Cloudinary/generate_image */}
          <div className="w-full h-full bg-black">
            <img 
              src="https://images.unsplash.com/photo-1542038784456-1ea8e935640e?q=80&w=2070&auto=format&fit=crop" 
              alt="Photography Hero" 
              className="w-full h-full object-cover opacity-50"
            />
          </div>
          <div className="absolute inset-0 bg-gradient-to-t from-luxury-black to-transparent" />
        </div>
        
        <div className="relative z-10 text-center px-4">
          <motion.h1 
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8, delay: 0.2 }}
            className="text-5xl md:text-7xl lg:text-8xl font-serif text-white mb-6 uppercase tracking-wider"
          >
            Capturing <span className="text-luxury-gold text-gradient">Moments</span>
          </motion.h1>
          
          <motion.p 
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ duration: 0.8, delay: 0.6 }}
            className="text-lg md:text-xl text-gray-300 mb-10 max-w-2xl mx-auto font-light tracking-wide"
          >
            Premium photography services for weddings, corporate events, and lifestyle portraits.
          </motion.p>
          
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8, delay: 0.8 }}
            className="flex flex-col sm:flex-row justify-center gap-4"
          >
            <Link to="/portfolio" className="px-8 py-3 bg-luxury-gold text-black font-semibold uppercase tracking-wider hover:bg-white transition-colors duration-300 text-center">
              View Portfolio
            </Link>
            <Link to="/book" className="px-8 py-3 border border-white text-white font-semibold uppercase tracking-wider hover:bg-white hover:text-black transition-colors duration-300 glass text-center">
              Book a Session
            </Link>
          </motion.div>
        </div>
      </section>
    </div>
  );
};

export default Home;
