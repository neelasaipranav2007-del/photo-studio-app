const Setting = require('../models/Setting');

// @desc    Get current site settings
// @route   GET /api/settings
// @access  Public
const getSettings = async (req, res) => {
  try {
    let settings = await Setting.findOne();
    if (!settings) {
      settings = await Setting.create({
        siteName: 'JonathanPortfolio',
        contactEmail: 'hello@jonathanportfolio.com',
        contactPhone: '+91 98765 43210',
        contactWhatsapp: '+91 98765 43210',
        notificationEmail: 'admin@jonathanportfolio.com',
        websiteTheme: 'luxury-gold',
        address: '123 Luxury Lane, Hyderabad, India 500081',
        socialLinks: {
          instagram: 'https://instagram.com',
          facebook: 'https://facebook.com',
          twitter: 'https://twitter.com'
        },
        heroText: 'Capturing Your Most Beautiful Moments',
        heroSubtext: 'Professional Photography & Cinematic Video Services'
      });
    }
    res.json(settings);
  } catch (error) {
    res.status(500).json({ message: 'Server error', error: error.message });
  }
};

// @desc    Update current site settings
// @route   PUT /api/settings
// @access  Private/Admin
const updateSettings = async (req, res) => {
  try {
    const { 
      siteName, logoUrl, contactEmail, contactPhone, contactWhatsapp, 
      notificationEmail, websiteTheme, address, socialLinks, heroText, heroSubtext 
    } = req.body;
    
    let settings = await Setting.findOne();
    if (!settings) {
      settings = new Setting({});
    }

    settings.siteName = siteName !== undefined ? siteName : settings.siteName;
    settings.logoUrl = logoUrl !== undefined ? logoUrl : settings.logoUrl;
    settings.contactEmail = contactEmail !== undefined ? contactEmail : settings.contactEmail;
    settings.contactPhone = contactPhone !== undefined ? contactPhone : settings.contactPhone;
    settings.contactWhatsapp = contactWhatsapp !== undefined ? contactWhatsapp : settings.contactWhatsapp;
    settings.notificationEmail = notificationEmail !== undefined ? notificationEmail : settings.notificationEmail;
    settings.websiteTheme = websiteTheme !== undefined ? websiteTheme : settings.websiteTheme;
    settings.address = address !== undefined ? address : settings.address;
    settings.heroText = heroText !== undefined ? heroText : settings.heroText;
    settings.heroSubtext = heroSubtext !== undefined ? heroSubtext : settings.heroSubtext;

    if (socialLinks) {
      settings.socialLinks = {
        instagram: socialLinks.instagram !== undefined ? socialLinks.instagram : settings.socialLinks?.instagram,
        facebook: socialLinks.facebook !== undefined ? socialLinks.facebook : settings.socialLinks?.facebook,
        twitter: socialLinks.twitter !== undefined ? socialLinks.twitter : settings.socialLinks?.twitter,
      };
    }

    const updatedSettings = await settings.save();
    res.json(updatedSettings);
  } catch (error) {
    res.status(500).json({ message: 'Server error', error: error.message });
  }
};

module.exports = {
  getSettings,
  updateSettings
};
