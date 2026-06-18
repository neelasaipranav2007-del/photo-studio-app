const Service = require('../models/Service');

// @desc    Get all services (supports all=true query for admin)
// @route   GET /api/services
// @access  Public
const getServices = async (req, res) => {
  try {
    const filter = req.query.all === 'true' ? {} : { isActive: true };
    const services = await Service.find(filter);
    res.json(services);
  } catch (error) {
    res.status(500).json({ message: 'Server error' });
  }
};

// @desc    Create a service
// @route   POST /api/services
// @access  Private/Admin
const createService = async (req, res) => {
  try {
    const { title, description, price, deliverables, imageUrl, isActive } = req.body;
    const service = new Service({ 
      title, 
      description, 
      price, 
      deliverables, 
      imageUrl,
      isActive: isActive !== undefined ? isActive : true
    });
    const createdService = await service.save();
    res.status(201).json(createdService);
  } catch (error) {
    res.status(500).json({ message: 'Server error', error: error.message });
  }
};

// @desc    Update a service
// @route   PUT /api/services/:id
// @access  Private/Admin
const updateService = async (req, res) => {
  try {
    const { title, description, price, deliverables, imageUrl, isActive } = req.body;
    const service = await Service.findById(req.params.id);

    if (service) {
      service.title = title !== undefined ? title : service.title;
      service.description = description !== undefined ? description : service.description;
      service.price = price !== undefined ? price : service.price;
      service.deliverables = deliverables !== undefined ? deliverables : service.deliverables;
      service.imageUrl = imageUrl !== undefined ? imageUrl : service.imageUrl;
      service.isActive = isActive !== undefined ? isActive : service.isActive;

      const updatedService = await service.save();
      res.json(updatedService);
    } else {
      res.status(404).json({ message: 'Service not found' });
    }
  } catch (error) {
    res.status(500).json({ message: 'Server error', error: error.message });
  }
};

// @desc    Delete a service
// @route   DELETE /api/services/:id
// @access  Private/Admin
const deleteService = async (req, res) => {
  try {
    const service = await Service.findById(req.params.id);
    if (service) {
      await Service.deleteOne({ _id: service._id });
      res.json({ message: 'Service removed' });
    } else {
      res.status(404).json({ message: 'Service not found' });
    }
  } catch (error) {
    res.status(500).json({ message: 'Server error' });
  }
};

module.exports = { 
  getServices, 
  createService,
  updateService,
  deleteService
};
