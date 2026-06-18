import React, { useState, useEffect, useContext } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { FiPlus, FiTrash2, FiEdit2, FiSave, FiX, FiArrowUp, FiArrowDown, FiUploadCloud, FiCheck } from 'react-icons/fi';
import axios from 'axios';
import { AuthContext } from '../../context/AuthContext';

const GalleryManager = () => {
  const { user } = useContext(AuthContext);
  const [images, setImages] = useState([]);
  const [categories, setCategories] = useState([]);
  const [selectedCategoryFilter, setSelectedCategoryFilter] = useState('All');
  const [loading, setLoading] = useState(true);

  // Category Manager State
  const [newCatName, setNewCatName] = useState('');
  const [editingCat, setEditingCat] = useState(null);
  const [editingCatName, setEditingCatName] = useState('');

  // Upload/Add Form State
  const [uploadTitle, setUploadTitle] = useState('');
  const [uploadCatId, setUploadCatId] = useState('');
  const [uploadFeatured, setUploadFeatured] = useState(false);
  const [selectedFiles, setSelectedFiles] = useState([]);
  const [uploadProgress, setUploadProgress] = useState(null); // 'idle', 'uploading', 'success', 'error'
  const [uploadMessage, setUploadMessage] = useState('');

  // Edit Image Modal State
  const [editingImage, setEditingImage] = useState(null); // image object when editing
  const [editTitle, setEditTitle] = useState('');
  const [editCatId, setEditCatId] = useState('');
  const [editFeatured, setEditFeatured] = useState(false);

  const fetchData = async () => {
    try {
      const { data: imagesData } = await axios.get('/api/gallery');
      const { data: catsData } = await axios.get('/api/categories');
      setImages(imagesData);
      setCategories(catsData);
      if (catsData.length > 0 && !uploadCatId) {
        setUploadCatId(catsData[0]._id);
      }
      setLoading(false);
    } catch (error) {
      console.error('Error fetching gallery data', error);
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchData();
  }, []);

  const handleCreateCategory = async (e) => {
    e.preventDefault();
    if (!newCatName.trim()) return;
    try {
      const config = { headers: { Authorization: `Bearer ${user?.token}` } };
      await axios.post('/api/categories', { name: newCatName }, config);
      setNewCatName('');
      fetchData();
    } catch (err) {
      alert(err.response?.data?.message || 'Failed to create category');
    }
  };

  const handleUpdateCategory = async (id) => {
    if (!editingCatName.trim()) return;
    try {
      const config = { headers: { Authorization: `Bearer ${user?.token}` } };
      await axios.put(`/api/categories/${id}`, { name: editingCatName }, config);
      setEditingCat(null);
      setEditingCatName('');
      fetchData();
    } catch (err) {
      alert(err.response?.data?.message || 'Failed to update category');
    }
  };

  const handleDeleteCategory = async (id) => {
    if (!window.confirm('Are you sure? This will delete the category. Images inside will remain but lose their category association.')) return;
    try {
      const config = { headers: { Authorization: `Bearer ${user?.token}` } };
      await axios.delete(`/api/categories/${id}`, config);
      fetchData();
    } catch (err) {
      alert('Failed to delete category');
    }
  };

  const handleFileChange = (e) => {
    setSelectedFiles(Array.from(e.target.files));
  };

  const handleUploadImages = async (e) => {
    e.preventDefault();
    if (selectedFiles.length === 0) {
      alert('Please select at least one image file.');
      return;
    }
    if (!uploadCatId) {
      alert('Please select or create a category first.');
      return;
    }

    setUploadProgress('uploading');
    setUploadMessage(`Uploading 1 of ${selectedFiles.length}...`);

    try {
      const config = { headers: { Authorization: `Bearer ${user?.token}` } };

      for (let i = 0; i < selectedFiles.length; i++) {
        setUploadMessage(`Uploading image ${i + 1} of ${selectedFiles.length}...`);
        
        // 1. Upload to Cloudinary via server
        const formData = new FormData();
        formData.append('image', selectedFiles[i]);
        
        const uploadRes = await axios.post('/api/upload', formData, {
          headers: {
            ...config.headers,
            'Content-Type': 'multipart/form-data'
          }
        });

        // 2. Save image details in DB
        const imagePayload = {
          title: uploadTitle || selectedFiles[i].name.split('.')[0] || 'Untitled',
          imageUrl: uploadRes.data.url,
          publicId: uploadRes.data.public_id,
          categoryId: uploadCatId,
          isFeatured: uploadFeatured
        };

        await axios.post('/api/gallery', imagePayload, config);
      }

      setUploadProgress('success');
      setUploadMessage('Upload completed successfully!');
      setSelectedFiles([]);
      setUploadTitle('');
      fetchData();
    } catch (err) {
      console.error(err);
      setUploadProgress('error');
      setUploadMessage('An error occurred during upload.');
    }
  };

  const handleDeleteImage = async (id) => {
    if (!window.confirm('Are you sure you want to delete this image?')) return;
    try {
      const config = { headers: { Authorization: `Bearer ${user?.token}` } };
      await axios.delete(`/api/gallery/${id}`, config);
      setImages(images.filter(img => img._id !== id));
    } catch (err) {
      alert('Failed to delete image.');
    }
  };

  const handleEditImageSave = async (e) => {
    e.preventDefault();
    if (!editingImage) return;
    try {
      const config = { headers: { Authorization: `Bearer ${user?.token}` } };
      await axios.put(`/api/gallery/${editingImage._id}`, {
        title: editTitle,
        categoryId: editCatId,
        isFeatured: editFeatured
      }, config);
      setEditingImage(null);
      fetchData();
    } catch (err) {
      alert('Failed to update image.');
    }
  };

  const moveImageOrder = async (index, direction) => {
    const categoryImages = filteredImages;
    if (index === 0 && direction === 'up') return;
    if (index === categoryImages.length - 1 && direction === 'down') return;

    const targetIndex = direction === 'up' ? index - 1 : index + 1;
    const reordered = [...categoryImages];
    
    // Swap
    const temp = reordered[index];
    reordered[index] = reordered[targetIndex];
    reordered[targetIndex] = temp;

    // Build payload for server
    const payload = reordered.map((img, i) => ({
      id: img._id,
      order: i
    }));

    try {
      // Optimistic state update
      const updatedImages = images.map(img => {
        const match = payload.find(p => p.id === img._id);
        return match ? { ...img, order: match.order } : img;
      });
      // Sort immediately in UI
      setImages(updatedImages.sort((a, b) => a.order - b.order));

      const config = { headers: { Authorization: `Bearer ${user?.token}` } };
      await axios.put('/api/gallery/reorder', { images: payload }, config);
    } catch (err) {
      console.error(err);
      alert('Failed to update image order on server.');
      fetchData(); // reset on error
    }
  };

  const filteredImages = images.filter(img => {
    return selectedCategoryFilter === 'All' || img.category?._id === selectedCategoryFilter;
  });

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64 text-luxury-gold">
        <div className="text-lg tracking-widest font-serif animate-pulse">Loading Gallery Panel...</div>
      </div>
    );
  }

  return (
    <div className="space-y-10 pb-12">
      <div>
        <h2 className="text-2xl font-serif text-white mb-2 tracking-wide">Manage Portfolio</h2>
        <p className="text-sm text-gray-400">Upload new images, configure sorting, and manage categories</p>
      </div>

      {/* Grid Layout: Left Upload Form, Right Category Editor */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        
        {/* Upload Form */}
        <div className="lg:col-span-2 glass border border-white/10 p-6 rounded-lg space-y-6">
          <h3 className="text-lg font-serif text-white tracking-widest uppercase flex items-center">
            <FiUploadCloud className="mr-2 text-luxury-gold" /> Upload Portfolio Photos
          </h3>
          <form onSubmit={handleUploadImages} className="space-y-4">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="block text-xs text-gray-400 mb-2 uppercase tracking-wider">Photo Title (Optional)</label>
                <input 
                  type="text" 
                  value={uploadTitle}
                  onChange={(e) => setUploadTitle(e.target.value)}
                  placeholder="Defaults to filename"
                  className="w-full bg-black/50 border border-white/10 text-white px-4 py-2 rounded focus:outline-none focus:border-luxury-gold text-sm" 
                />
              </div>
              <div>
                <label className="block text-xs text-gray-400 mb-2 uppercase tracking-wider">Assign Category</label>
                <select 
                  value={uploadCatId}
                  onChange={(e) => setUploadCatId(e.target.value)}
                  className="w-full bg-black/50 border border-white/10 text-white px-4 py-2 rounded focus:outline-none focus:border-luxury-gold text-sm appearance-none"
                >
                  {categories.map(cat => (
                    <option key={cat._id} value={cat._id}>{cat.name}</option>
                  ))}
                </select>
              </div>
            </div>

            <div className="flex items-center space-x-3">
              <input 
                type="checkbox" 
                id="featured" 
                checked={uploadFeatured} 
                onChange={(e) => setUploadFeatured(e.target.checked)} 
                className="w-4 h-4 bg-black border border-white/20 text-luxury-gold rounded focus:ring-0 focus:ring-offset-0" 
              />
              <label htmlFor="featured" className="text-xs text-gray-300 uppercase tracking-widest">Mark as Featured (Hero Section)</label>
            </div>

            {/* Drag Drop Area */}
            <div className="border-2 border-dashed border-white/10 rounded-lg p-6 text-center hover:border-luxury-gold/50 transition-colors">
              <input 
                type="file" 
                multiple 
                accept="image/*" 
                onChange={handleFileChange} 
                id="files" 
                className="hidden" 
              />
              <label htmlFor="files" className="cursor-pointer space-y-2 block">
                <FiUploadCloud className="mx-auto text-4xl text-luxury-gold/70" />
                <span className="block text-sm text-white font-medium">Select single or multiple photos</span>
                <span className="block text-xs text-gray-500">Supports JPG, PNG, WEBP</span>
              </label>
              {selectedFiles.length > 0 && (
                <div className="mt-4 text-xs bg-luxury-gold/10 text-luxury-gold border border-luxury-gold/20 p-2 rounded max-h-32 overflow-y-auto">
                  <strong>Selected files:</strong> {selectedFiles.map(f => f.name).join(', ')}
                </div>
              )}
            </div>

            {/* Progress Bar / Messaging */}
            {uploadProgress && (
              <div className={`p-4 rounded border text-xs flex items-center justify-between ${
                uploadProgress === 'uploading' ? 'bg-yellow-500/10 border-yellow-500/30 text-yellow-400' :
                uploadProgress === 'success' ? 'bg-green-500/10 border-green-500/30 text-green-400' :
                'bg-red-500/10 border-red-500/30 text-red-400'
              }`}>
                <span>{uploadMessage}</span>
                {uploadProgress === 'success' && <FiCheck className="text-lg" />}
              </div>
            )}

            <button 
              type="submit" 
              disabled={uploadProgress === 'uploading' || selectedFiles.length === 0}
              className={`w-full py-3 text-black font-bold uppercase tracking-widest transition-all ${
                selectedFiles.length === 0 || uploadProgress === 'uploading' 
                  ? 'bg-gray-600 text-gray-400 cursor-not-allowed' 
                  : 'bg-luxury-gold hover:bg-white'
              }`}
            >
              Upload Photos
            </button>
          </form>
        </div>

        {/* Category List CRUD */}
        <div className="glass border border-white/10 p-6 rounded-lg space-y-6">
          <h3 className="text-lg font-serif text-white tracking-widest uppercase flex items-center">
            Categories List
          </h3>

          <form onSubmit={handleCreateCategory} className="flex space-x-2">
            <input 
              type="text" 
              value={newCatName}
              onChange={(e) => setNewCatName(e.target.value)}
              placeholder="Custom category name"
              required
              className="flex-1 bg-black/50 border border-white/10 text-white px-3 py-2 rounded focus:outline-none focus:border-luxury-gold text-sm" 
            />
            <button type="submit" className="p-2 bg-luxury-gold text-black hover:bg-white rounded transition-colors">
              <FiPlus />
            </button>
          </form>

          <div className="space-y-2 max-h-[260px] overflow-y-auto pr-1">
            {categories.map(cat => (
              <div key={cat._id} className="flex items-center justify-between bg-white/5 border border-white/5 px-4 py-2 rounded text-sm text-white">
                {editingCat === cat._id ? (
                  <input 
                    type="text"
                    value={editingCatName}
                    onChange={(e) => setEditingCatName(e.target.value)}
                    className="bg-black text-white px-2 py-0.5 border border-luxury-gold text-xs rounded focus:outline-none"
                  />
                ) : (
                  <span>{cat.name}</span>
                )}
                <div className="flex space-x-1">
                  {editingCat === cat._id ? (
                    <>
                      <button onClick={() => handleUpdateCategory(cat._id)} className="p-1 hover:text-green-400 text-green-500"><FiSave size={14} /></button>
                      <button onClick={() => setEditingCat(null)} className="p-1 hover:text-red-400 text-gray-400"><FiX size={14} /></button>
                    </>
                  ) : (
                    <>
                      <button onClick={() => { setEditingCat(cat._id); setEditingCatName(cat.name); }} className="p-1 hover:text-luxury-gold text-gray-400"><FiEdit2 size={14} /></button>
                      <button onClick={() => handleDeleteCategory(cat._id)} className="p-1 hover:text-red-400 text-gray-400"><FiTrash2 size={14} /></button>
                    </>
                  )}
                </div>
              </div>
            ))}
          </div>
        </div>

      </div>

      {/* Image Grid Editor with sorting */}
      <div className="space-y-6">
        <div className="flex flex-col space-y-4">
          <div>
            <h3 className="text-xl font-serif text-white tracking-widest uppercase">Portfolio Galleries</h3>
            <p className="text-xs text-gray-400">Reorder photos using up/down arrows (or edit/delete)</p>
          </div>
          
          {/* Categories Filter Tabs */}
          <div className="flex flex-wrap gap-2 bg-black/35 border border-white/5 p-2 rounded-lg">
            <button
              onClick={() => setSelectedCategoryFilter('All')}
              className={`px-4 py-2 rounded text-xs uppercase tracking-wider transition-all duration-300 border ${
                selectedCategoryFilter === 'All'
                  ? 'border-luxury-gold bg-luxury-gold text-black font-bold shadow-[0_0_10px_rgba(212,175,55,0.2)]'
                  : 'border-white/5 text-gray-400 hover:border-luxury-gold/50 hover:text-luxury-gold bg-white/5'
              }`}
            >
              All Categories
            </button>
            {categories.map(c => (
              <button
                key={c._id}
                onClick={() => setSelectedCategoryFilter(c._id)}
                className={`px-4 py-2 rounded text-xs uppercase tracking-wider transition-all duration-300 border ${
                  selectedCategoryFilter === c._id
                    ? 'border-luxury-gold bg-luxury-gold text-black font-bold shadow-[0_0_10px_rgba(212,175,55,0.2)]'
                    : 'border-white/5 text-gray-400 hover:border-luxury-gold/50 hover:text-luxury-gold bg-white/5'
                }`}
              >
                {c.name}
              </button>
            ))}
          </div>
        </div>

        {/* Thumbnail grid */}
        <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-6 gap-4">
          {filteredImages.map((img, idx) => (
            <div key={img._id} className="relative group glass border border-white/10 rounded overflow-hidden flex flex-col justify-between">
              <div className="relative overflow-hidden h-32">
                <img 
                  src={img.imageUrl} 
                  alt={img.title} 
                  className="w-full h-full object-cover" 
                />
                {/* Delete overlay button on hover */}
                <button
                  onClick={() => handleDeleteImage(img._id)}
                  title="Remove Photo"
                  className="absolute top-2 right-2 p-1.5 bg-red-600/90 text-white rounded-full opacity-0 group-hover:opacity-100 transition-opacity duration-200 hover:bg-red-700"
                >
                  <FiTrash2 size={13} />
                </button>
              </div>
              <div className="p-3 flex-1 flex flex-col justify-between space-y-3">
                <div>
                  <h4 className="text-xs text-white truncate font-medium">{img.title}</h4>
                  <p className="text-[9px] text-luxury-gold uppercase tracking-wider truncate mt-0.5">{img.category?.name || 'General'}</p>
                </div>
                
                {/* Arrow sorting and buttons */}
                <div className="flex flex-col space-y-2 pt-2 border-t border-white/5">
                  <div className="flex justify-between items-center text-gray-400">
                    <span className="text-[10px] text-gray-500 font-mono">Order</span>
                    <div className="flex space-x-1">
                      <button 
                        onClick={() => moveImageOrder(idx, 'up')}
                        disabled={idx === 0}
                        className="p-1 hover:text-luxury-gold disabled:opacity-30 disabled:hover:text-gray-400 bg-white/5 rounded"
                      >
                        <FiArrowUp size={12} />
                      </button>
                      <button 
                        onClick={() => moveImageOrder(idx, 'down')}
                        disabled={idx === filteredImages.length - 1}
                        className="p-1 hover:text-luxury-gold disabled:opacity-30 disabled:hover:text-gray-400 bg-white/5 rounded"
                      >
                        <FiArrowDown size={12} />
                      </button>
                    </div>
                  </div>

                  <div className="flex space-x-2 w-full">
                    <button 
                      onClick={() => {
                        setEditingImage(img);
                        setEditTitle(img.title);
                        setEditCatId(img.category?._id || categories[0]?._id);
                        setEditFeatured(img.isFeatured || false);
                      }}
                      className="flex-1 py-1 text-[10px] text-center bg-white/5 hover:bg-white/10 text-white border border-white/10 rounded transition-all flex items-center justify-center space-x-1"
                    >
                      <FiEdit2 size={10} /> <span>Edit</span>
                    </button>
                    <button 
                      onClick={() => handleDeleteImage(img._id)}
                      className="flex-1 py-1 text-[10px] text-center bg-red-950/25 hover:bg-red-900/40 text-red-400 border border-red-500/20 rounded transition-all flex items-center justify-center space-x-1"
                    >
                      <FiTrash2 size={10} /> <span>Remove</span>
                    </button>
                  </div>
                </div>
              </div>

              {img.isFeatured && (
                <span className="absolute top-1.5 left-1.5 px-1.5 py-0.5 bg-luxury-gold text-black font-bold text-[8px] uppercase tracking-wider rounded">
                  Featured
                </span>
              )}
            </div>
          ))}

          {filteredImages.length === 0 && (
            <div className="col-span-full py-16 text-center text-gray-500 text-sm italic">
              No photos found in this category.
            </div>
          )}
        </div>
      </div>

      {/* EDIT IMAGE METADATA MODAL */}
      <AnimatePresence>
        {editingImage && (
          <div className="fixed inset-0 z-50 bg-black/85 flex items-center justify-center p-4">
            <motion.div 
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.95 }}
              className="glass border border-white/10 p-8 rounded-lg w-full max-w-md text-white relative space-y-6"
            >
              <button onClick={() => setEditingImage(null)} className="absolute top-6 right-6 text-gray-400 hover:text-white text-xl">
                <FiX />
              </button>

              <h3 className="text-xl font-serif text-white uppercase tracking-widest">Edit Photo Details</h3>

              <form onSubmit={handleEditImageSave} className="space-y-4">
                <div>
                  <label className="block text-xs text-gray-400 mb-2 uppercase tracking-wider">Photo Title</label>
                  <input 
                    type="text" 
                    value={editTitle}
                    onChange={(e) => setEditTitle(e.target.value)}
                    required
                    className="w-full bg-black/50 border border-white/10 text-white px-4 py-2.5 rounded focus:outline-none focus:border-luxury-gold text-sm" 
                  />
                </div>
                <div>
                  <label className="block text-xs text-gray-400 mb-2 uppercase tracking-wider">Category</label>
                  <select 
                    value={editCatId}
                    onChange={(e) => setEditCatId(e.target.value)}
                    className="w-full bg-black/50 border border-white/10 text-white px-4 py-2.5 rounded focus:outline-none focus:border-luxury-gold text-sm appearance-none"
                  >
                    {categories.map(cat => (
                      <option key={cat._id} value={cat._id}>{cat.name}</option>
                    ))}
                  </select>
                </div>
                <div className="flex items-center space-x-3">
                  <input 
                    type="checkbox" 
                    id="editFeatured" 
                    checked={editFeatured} 
                    onChange={(e) => setEditFeatured(e.target.checked)} 
                    className="w-4 h-4 bg-black border border-white/20 text-luxury-gold rounded focus:ring-0 focus:ring-offset-0" 
                  />
                  <label htmlFor="editFeatured" className="text-xs text-gray-300 uppercase tracking-widest font-mono">Featured in Hero Slider</label>
                </div>
                <button 
                  type="submit" 
                  className="w-full py-3 bg-luxury-gold text-black font-bold uppercase tracking-widest hover:bg-white transition-colors text-sm"
                >
                  Save Changes
                </button>
              </form>
            </motion.div>
          </div>
        )}
      </AnimatePresence>
    </div>
  );
};

export default GalleryManager;
