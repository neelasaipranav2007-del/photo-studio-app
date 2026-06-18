const prisma = require('../config/prisma');

// @desc    Get current site settings
// @route   GET /api/settings
// @access  Public
const getSettings = async (req, res) => {
  try {
    console.log("Starting DB query in getSettings...");
    let settings = await prisma.setting.findFirst();
    console.log("DB query finished. Settings:", settings ? "found" : "null");
    if (!settings) {
      settings = await prisma.setting.create({
        data: {
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
        }
      });
    }
    res.json({ ...settings, _id: settings.id });
  } catch (error) {
    console.error("FATAL ERROR IN getSettings:", error);
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
    
    let settings = await prisma.setting.findFirst();
    
    const dataToUpdate = {};
    if (siteName !== undefined) dataToUpdate.siteName = siteName;
    if (logoUrl !== undefined) dataToUpdate.logoUrl = logoUrl;
    if (contactEmail !== undefined) dataToUpdate.contactEmail = contactEmail;
    if (contactPhone !== undefined) dataToUpdate.contactPhone = contactPhone;
    if (contactWhatsapp !== undefined) dataToUpdate.contactWhatsapp = contactWhatsapp;
    if (notificationEmail !== undefined) dataToUpdate.notificationEmail = notificationEmail;
    if (websiteTheme !== undefined) dataToUpdate.websiteTheme = websiteTheme;
    if (address !== undefined) dataToUpdate.address = address;
    if (heroText !== undefined) dataToUpdate.heroText = heroText;
    if (heroSubtext !== undefined) dataToUpdate.heroSubtext = heroSubtext;

    if (socialLinks) {
      const currentSocialLinks = settings ? settings.socialLinks : {};
      dataToUpdate.socialLinks = {
        instagram: socialLinks.instagram !== undefined ? socialLinks.instagram : currentSocialLinks?.instagram,
        facebook: socialLinks.facebook !== undefined ? socialLinks.facebook : currentSocialLinks?.facebook,
        twitter: socialLinks.twitter !== undefined ? socialLinks.twitter : currentSocialLinks?.twitter,
      };
    }

    let updatedSettings;
    if (!settings) {
      updatedSettings = await prisma.setting.create({ data: dataToUpdate });
    } else {
      updatedSettings = await prisma.setting.update({
        where: { id: settings.id },
        data: dataToUpdate
      });
    }

    res.json({ ...updatedSettings, _id: updatedSettings.id });
  } catch (error) {
    res.status(500).json({ message: 'Server error', error: error.message });
  }
};

module.exports = {
  getSettings,
  updateSettings
};
