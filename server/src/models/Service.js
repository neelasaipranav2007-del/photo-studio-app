const mongoose = require('mongoose');

const serviceSchema = new mongoose.Schema({
  title: {
    type: String,
    required: true,
  },
  description: {
    type: String,
    required: true,
  },
  price: {
    type: Number,
    required: true,
  },
  deliverables: [
    {
      type: String,
    }
  ],
  imageUrl: {
    type: String,
  },
  isActive: {
    type: Boolean,
    default: true,
  },
}, { timestamps: true });

const Service = mongoose.model('Service', serviceSchema);
module.exports = Service;
