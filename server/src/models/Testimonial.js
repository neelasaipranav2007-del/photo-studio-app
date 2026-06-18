const mongoose = require('mongoose');

const testimonialSchema = new mongoose.Schema({
  name: {
    type: String,
    required: true,
  },
  rating: {
    type: Number,
    required: true,
    min: 1,
    max: 5,
  },
  comment: {
    type: String,
    required: true,
  },
  isApproved: {
    type: Boolean,
    default: false,
  },
}, { timestamps: true });

const Testimonial = mongoose.model('Testimonial', testimonialSchema);
module.exports = Testimonial;
