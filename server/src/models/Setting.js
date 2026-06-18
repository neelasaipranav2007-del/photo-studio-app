const mongoose = require('mongoose');

const settingSchema = new mongoose.Schema({
  siteName: { type: String, default: 'JonathanPortfolio' },
  logoUrl: { type: String },
  contactEmail: { type: String },
  contactPhone: { type: String },
  contactWhatsapp: { type: String },
  notificationEmail: { type: String },
  websiteTheme: { type: String, default: 'luxury-gold' },
  address: { type: String },
  socialLinks: {
    instagram: { type: String },
    facebook: { type: String },
    twitter: { type: String },
  },
  heroText: { type: String },
  heroSubtext: { type: String },
}, { timestamps: true });

const Setting = mongoose.model('Setting', settingSchema);
module.exports = Setting;
