const mongoose = require('mongoose');

const bookingSchema = new mongoose.Schema({
  customerName: { type: String, required: true },
  email: { type: String, required: true },
  phone: { type: String, required: true },
  eventDate: { type: Date, required: true },
  eventTime: { type: String, required: true },
  eventType: { type: String },
  eventLocation: { type: String, required: true },
  guestCount: { type: Number },
  budgetRange: { type: String },
  specialRequirements: { type: String },
  services: [
    {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Service',
    }
  ],
  status: {
    type: String,
    enum: ['New Inquiry', 'Reviewed', 'Contacted', 'Confirmed', 'Completed', 'Cancelled'],
    default: 'New Inquiry',
  },
  totalPrice: {
    type: Number,
    required: true,
  },
  referenceNumber: { 
    type: String, 
    required: true, 
    unique: true 
  },
  isContactQuery: {
    type: Boolean,
    default: false,
  },
  neededImprovements: {
    type: String,
  },
  emailsSent: [{
    dateSent: { type: Date, default: Date.now },
    emailType: { type: String }, // 'Reply', 'Invoice', 'Quotation', 'Confirmation'
    status: { type: String, default: 'Sent' },
    subject: { type: String }
  }]
}, { timestamps: true });

const Booking = mongoose.model('Booking', bookingSchema);
module.exports = Booking;
