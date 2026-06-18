import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { FiX, FiZoomIn } from 'react-icons/fi';
import axios from 'axios';

const Portfolio = () => {
  const [filter, setFilter] = useState('All');
  const [lightbox, setLightbox] = useState(null);
  const [gallery, setGallery] = useState([]);
  const [categories, setCategories] = useState(['All']);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchData = async () => {
      try {
        const [galleryRes, categoriesRes] = await Promise.all([
          axios.get('/api/gallery'),
          axios.get('/api/categories')
        ]);
        setGallery(galleryRes.data);
        setCategories(['All', ...categoriesRes.data.map(c => c.name)]);
        setLoading(false);
      } catch (err) {
        console.error('Error fetching portfolio data', err);
        setLoading(false);
      }
    };
    fetchData();
  }, []);

  const filteredGallery = filter === 'All' 
    ? gallery 
    : gallery.filter(img => img.category?.name === filter);

  if (loading) {
    return (
      <div className="min-h-screen bg-black flex items-center justify-center text-luxury-gold pt-20">
        <div className="text-xl tracking-widest font-serif animate-pulse">Loading Portfolio...</div>
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
            Portfolio
          </motion.h1>
          <div className="w-24 h-1 bg-luxury-gold mx-auto mb-8"></div>
          
          {/* Filters */}
          <div className="flex flex-wrap justify-center gap-4">
            {categories.map(cat => (
              <button
                key={cat}
                onClick={() => setFilter(cat)}
                className={`px-6 py-2 text-sm uppercase tracking-wider transition-colors duration-300 border ${
                  filter === cat 
                    ? 'border-luxury-gold bg-luxury-gold text-black' 
                    : 'border-white/20 text-white hover:border-luxury-gold hover:text-luxury-gold glass'
                }`}
              >
                {cat}
              </button>
            ))}
          </div>
        </div>

        {/* Gallery Grid */}
        <motion.div layout className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          <AnimatePresence>
            {filteredGallery.map((item) => (
              <motion.div
                layout
                initial={{ opacity: 0, scale: 0.9 }}
                animate={{ opacity: 1, scale: 1 }}
                exit={{ opacity: 0, scale: 0.9 }}
                transition={{ duration: 0.4 }}
                key={item._id}
                className="group relative overflow-hidden aspect-[4/5] cursor-pointer border border-white/5"
                onClick={() => setLightbox(item)}
              >
                <img 
                  src={item.imageUrl} 
                  alt={item.title} 
                  loading="lazy"
                  className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-110"
                />
                <div className="absolute inset-0 bg-black/60 opacity-0 group-hover:opacity-100 transition-opacity duration-300 flex flex-col items-center justify-center">
                  <FiZoomIn className="text-luxury-gold text-4xl mb-4" />
                  <h3 className="text-white font-serif text-xl tracking-wider px-4 text-center">{item.title}</h3>
                  <p className="text-luxury-gold text-sm tracking-widest uppercase mt-2">{item.category?.name || 'General'}</p>
                </div>
              </motion.div>
            ))}
          </AnimatePresence>
        </motion.div>

        {filteredGallery.length === 0 && (
          <div className="text-center py-20 text-gray-500">
            No images in this category yet.
          </div>
        )}

        {/* Lightbox */}
        <AnimatePresence>
          {lightbox && (
            <motion.div 
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className="fixed inset-0 z-[100] bg-black/95 flex items-center justify-center p-4"
              onClick={() => setLightbox(null)}
            >
              <button className="absolute top-8 right-8 text-white hover:text-luxury-gold transition-colors text-3xl">
                <FiX />
              </button>
              <motion.img 
                initial={{ scale: 0.9 }}
                animate={{ scale: 1 }}
                src={lightbox.imageUrl} 
                alt={lightbox.title}
                className="max-w-full max-h-[90vh] object-contain border border-white/10"
              />
              <div className="absolute bottom-8 text-center">
                <h3 className="text-white font-serif text-2xl tracking-wider">{lightbox.title}</h3>
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </div>
    </div>
  );
};

export default Portfolio;
