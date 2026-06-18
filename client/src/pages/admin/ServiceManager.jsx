import React, { useState, useEffect, useContext } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { FiPlus, FiTrash2, FiEdit2, FiX, FiCheck, FiUploadCloud } from 'react-icons/fi';
import axios from 'axios';
import { AuthContext } from '../../context/AuthContext';

const ServiceManager = () => {
  const { user } = useContext(AuthContext);
  const [services, setServices] = useState([]);
  const [loading, setLoading] = useState(true);

  // Form Modals State
  const [activeModal, setActiveModal] = useState(null); // 'add' or 'edit' or null
  const [editingService, setEditingService] = useState(null);

  // Form Fields State
  const [title, setTitle] = useState('');
  const [price, setPrice] = useState('');
  const [description, setDescription] = useState('');
  const [deliverablesText, setDeliverablesText] = useState(''); // one per line
  const [imageUrl, setImageUrl] = useState('');
  const [isActive, setIsActive] = useState(true);

  const [uploadingImage, setUploadingImage] = useState(false);

  const fetchServices = async () => {
    try {
      const { data } = await axios.get('/api/services?all=true');
      setServices(data);
      setLoading(false);
    } catch (error) {
      console.error('Error fetching services', error);
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchServices();
  }, []);

  const openAddModal = () => {
    setTitle('');
    setPrice('');
    setDescription('');
    setDeliverablesText('');
    setImageUrl('');
    setIsActive(true);
    setActiveModal('add');
  };

  const openEditModal = (service) => {
    setEditingService(service);
    setTitle(service.title);
    setPrice(service.price.toString());
    setDescription(service.description);
    setDeliverablesText(service.deliverables.join('\n'));
    setImageUrl(service.imageUrl || '');
    setIsActive(service.isActive);
    setActiveModal('edit');
  };

  const handleImageUpload = async (e) => {
    const file = e.target.files[0];
    if (!file) return;

    setUploadingImage(true);
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
      setImageUrl(data.url);
      setUploadingImage(false);
    } catch (err) {
      console.error('Image upload failed', err);
      alert('Failed to upload image.');
      setUploadingImage(false);
    }
  };

  const handleSaveService = async (e) => {
    e.preventDefault();
    if (!title.trim() || !price || !description.trim() || !imageUrl) {
      alert('Please fill out all fields including the package image.');
      return;
    }

    const deliverables = deliverablesText
      .split('\n')
      .map(line => line.trim())
      .filter(line => line.length > 0);

    const payload = {
      title,
      price: Number(price),
      description,
      deliverables,
      imageUrl,
      isActive
    };

    try {
      const config = { headers: { Authorization: `Bearer ${user?.token}` } };
      
      if (activeModal === 'add') {
        await axios.post('/api/services', payload, config);
      } else {
        await axios.put(`/api/services/${editingService._id}`, payload, config);
      }

      setActiveModal(null);
      fetchServices();
    } catch (err) {
      console.error(err);
      alert('Failed to save service.');
    }
  };

  const handleToggleActive = async (service) => {
    try {
      const config = { headers: { Authorization: `Bearer ${user?.token}` } };
      const nextActiveState = !service.isActive;
      
      // Optimistic UI update
      setServices(services.map(s => s._id === service._id ? { ...s, isActive: nextActiveState } : s));

      await axios.put(`/api/services/${service._id}`, {
        isActive: nextActiveState
      }, config);
    } catch (err) {
      console.error(err);
      alert('Failed to toggle active state.');
      fetchServices(); // revert on error
    }
  };

  const handleDeleteService = async (id) => {
    if (!window.confirm('Are you sure you want to delete this service package? This action cannot be undone.')) return;
    try {
      const config = { headers: { Authorization: `Bearer ${user?.token}` } };
      await axios.delete(`/api/services/${id}`, config);
      setServices(services.filter(s => s._id !== id));
    } catch (err) {
      alert('Failed to delete service.');
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64 text-luxury-gold">
        <div className="text-lg tracking-widest font-serif animate-pulse">Loading Services Panel...</div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
        <div>
          <h2 className="text-2xl font-serif text-white tracking-wide">Manage Services</h2>
          <p className="text-sm text-gray-400">Add, edit, or configure pricing for your photography packages</p>
        </div>
        <button 
          onClick={openAddModal}
          className="flex items-center space-x-2 bg-luxury-gold text-black px-5 py-2.5 rounded font-bold uppercase tracking-wider hover:bg-white transition-colors text-sm"
        >
          <FiPlus />
          <span>Add New Package</span>
        </button>
      </div>

      {/* Services Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {services.map(service => (
          <div key={service._id} className={`glass flex flex-col justify-between border rounded-lg overflow-hidden transition-all duration-300 ${
            service.isActive ? 'border-white/10 opacity-100' : 'border-red-500/20 opacity-70 bg-black/40'
          }`}>
            <div className="h-44 w-full overflow-hidden relative">
              <img src={service.imageUrl} alt={service.title} className="w-full h-full object-cover" />
              {!service.isActive && (
                <div className="absolute inset-0 bg-black/75 flex items-center justify-center">
                  <span className="px-3 py-1 bg-red-500/20 border border-red-500/50 text-red-500 text-xs font-bold uppercase tracking-wider rounded">
                    Disabled / Inactive
                  </span>
                </div>
              )}
            </div>
            
            <div className="p-6 flex-1 flex flex-col justify-between">
              <div className="space-y-4">
                <div className="flex justify-between items-start">
                  <h3 className="text-lg font-serif text-white truncate max-w-[70%]">{service.title}</h3>
                  <span className="text-luxury-gold font-bold text-lg">₹{service.price.toLocaleString('en-IN')}</span>
                </div>
                
                <p className="text-xs text-gray-400 line-clamp-3 font-light leading-relaxed">{service.description}</p>
                
                <div>
                  <h4 className="text-[10px] uppercase tracking-widest text-gray-500 mb-2 font-mono">Deliverables:</h4>
                  <ul className="text-xs text-gray-300 space-y-1 max-h-24 overflow-y-auto pr-1">
                    {service.deliverables.map((item, idx) => (
                      <li key={idx} className="flex items-center">
                        <span className="w-1.5 h-1.5 bg-luxury-gold rounded-full mr-2"></span>
                        <span className="truncate">{item}</span>
                      </li>
                    ))}
                  </ul>
                </div>
              </div>

              <div className="flex items-center justify-between mt-6 pt-4 border-t border-white/5">
                {/* Active Toggle */}
                <div className="flex items-center space-x-2">
                  <button 
                    onClick={() => handleToggleActive(service)}
                    className={`w-10 h-5 rounded-full p-0.5 transition-colors duration-300 focus:outline-none ${
                      service.isActive ? 'bg-luxury-gold' : 'bg-white/10 border border-white/10'
                    }`}
                  >
                    <div className={`w-4 h-4 rounded-full bg-black shadow-md transform transition-transform duration-300 ${
                      service.isActive ? 'translate-x-5' : 'translate-x-0'
                    }`}></div>
                  </button>
                  <span className="text-[10px] text-gray-400 uppercase tracking-wider">
                    {service.isActive ? 'Active' : 'Disabled'}
                  </span>
                </div>

                <div className="flex space-x-2">
                  <button onClick={() => openEditModal(service)} className="p-2 bg-white/5 text-gray-400 hover:text-white rounded border border-white/10 transition-colors">
                    <FiEdit2 size={13} />
                  </button>
                  <button onClick={() => handleDeleteService(service._id)} className="p-2 bg-red-500/10 text-red-400 hover:text-red-300 rounded border border-red-500/20 transition-colors">
                    <FiTrash2 size={13} />
                  </button>
                </div>
              </div>
            </div>
          </div>
        ))}

        {services.length === 0 && (
          <div className="col-span-full py-16 text-center text-gray-500 italic">
            No service packages configured yet. Click "Add New Package" to create one.
          </div>
        )}
      </div>

      {/* ADD / EDIT SERVICE MODAL */}
      <AnimatePresence>
        {activeModal && (
          <div className="fixed inset-0 z-50 bg-black/80 flex items-center justify-center p-4 overflow-y-auto">
            <motion.div 
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.95 }}
              className="glass border border-white/10 p-8 rounded-lg w-full max-w-2xl text-white relative space-y-6"
            >
              <button onClick={() => setActiveModal(null)} className="absolute top-6 right-6 text-gray-400 hover:text-white text-xl">
                <FiX />
              </button>

              <h3 className="text-xl font-serif text-white uppercase tracking-widest">
                {activeModal === 'add' ? 'Add New Service Package' : 'Edit Service Package'}
              </h3>

              <form onSubmit={handleSaveService} className="space-y-4">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-xs text-gray-400 mb-2 uppercase tracking-wider">Package Title</label>
                    <input 
                      type="text" 
                      value={title}
                      onChange={(e) => setTitle(e.target.value)}
                      required
                      placeholder="E.g. Premium Wedding Package"
                      className="w-full bg-black/50 border border-white/10 text-white px-4 py-2.5 rounded focus:outline-none focus:border-luxury-gold text-sm" 
                    />
                  </div>
                  <div>
                    <label className="block text-xs text-gray-400 mb-2 uppercase tracking-wider">Pricing (₹)</label>
                    <input 
                      type="number" 
                      value={price}
                      onChange={(e) => setPrice(e.target.value)}
                      required
                      placeholder="E.g. 150000"
                      className="w-full bg-black/50 border border-white/10 text-white px-4 py-2.5 rounded focus:outline-none focus:border-luxury-gold text-sm" 
                    />
                  </div>
                </div>

                <div>
                  <label className="block text-xs text-gray-400 mb-2 uppercase tracking-wider">Description</label>
                  <textarea 
                    value={description}
                    onChange={(e) => setDescription(e.target.value)}
                    required
                    rows="3"
                    placeholder="Provide a detailed description of the photography coverage and overall service value..."
                    className="w-full bg-black/50 border border-white/10 text-white px-4 py-2.5 rounded focus:outline-none focus:border-luxury-gold text-sm"
                  ></textarea>
                </div>

                <div>
                  <label className="block text-xs text-gray-400 mb-2 uppercase tracking-wider">Deliverables (One per line)</label>
                  <textarea 
                    value={deliverablesText}
                    onChange={(e) => setDeliverablesText(e.target.value)}
                    required
                    rows="4"
                    placeholder={`800+ Edited High-Res Photos\nDrone Cinematography\nPrinted Coffee Table Album`}
                    className="w-full bg-black/50 border border-white/10 text-white px-4 py-2.5 rounded focus:outline-none focus:border-luxury-gold text-sm font-mono"
                  ></textarea>
                </div>

                {/* Cover Image Upload */}
                <div>
                  <label className="block text-xs text-gray-400 mb-2 uppercase tracking-wider">Cover Image</label>
                  <div className="flex items-center space-x-4">
                    <input 
                      type="file" 
                      accept="image/*" 
                      onChange={handleImageUpload} 
                      id="service-image-upload" 
                      className="hidden" 
                    />
                    <label htmlFor="service-image-upload" className="cursor-pointer flex items-center space-x-2 bg-white/5 hover:bg-white/10 border border-white/10 text-white px-4 py-2 rounded text-sm transition-all whitespace-nowrap">
                      <FiUploadCloud />
                      <span>{uploadingImage ? 'Uploading...' : 'Choose Image'}</span>
                    </label>
                    <input 
                      type="text" 
                      value={imageUrl} 
                      onChange={(e) => setImageUrl(e.target.value)} 
                      placeholder="Image URL" 
                      required 
                      className="flex-1 bg-black/50 border border-white/10 text-white px-4 py-2 rounded focus:outline-none text-xs" 
                    />
                  </div>
                  {imageUrl && (
                    <div className="mt-3 h-20 w-32 border border-white/10 rounded overflow-hidden">
                      <img src={imageUrl} alt="Preview" className="w-full h-full object-cover" />
                    </div>
                  )}
                </div>

                <div className="flex items-center space-x-3 pt-2">
                  <input 
                    type="checkbox" 
                    id="isActive" 
                    checked={isActive} 
                    onChange={(e) => setIsActive(e.target.checked)} 
                    className="w-4 h-4 bg-black border border-white/20 text-luxury-gold rounded focus:ring-0 focus:ring-offset-0" 
                  />
                  <label htmlFor="isActive" className="text-xs text-gray-300 uppercase tracking-widest font-mono">Enable immediately on site</label>
                </div>

                <button 
                  type="submit" 
                  disabled={uploadingImage}
                  className="w-full py-3 bg-luxury-gold text-black font-bold uppercase tracking-widest hover:bg-white transition-colors text-sm"
                >
                  Save Package
                </button>
              </form>
            </motion.div>
          </div>
        )}
      </AnimatePresence>
    </div>
  );
};

export default ServiceManager;
