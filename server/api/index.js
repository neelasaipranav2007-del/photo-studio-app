const express = require('express');
const dotenv = require('dotenv');
const cors = require('cors');
const helmet = require('helmet');
const morgan = require('morgan');
const path = require('path');
const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();
const bcrypt = require('bcryptjs');

// Load env vars
dotenv.config();

// Seed database if empty
async function seedDatabase() {
  try {
    const serviceCount = await prisma.service.count();
    if (serviceCount === 0) {
      console.log('Seeding database via Prisma...');

      // 1. Create Admin User
      const salt = await bcrypt.genSalt(10);
      const hashedPassword = await bcrypt.hash('admin123', salt);
      await prisma.user.create({
        data: {
          name: 'Jonathan Admin',
          email: 'admin@jonathanportfolio.com',
          password: hashedPassword,
          role: 'admin'
        }
      });

      // 2. Create Categories
      const categoriesData = [
        { name: 'Weddings', slug: 'weddings' },
        { name: 'Birthdays', slug: 'birthdays' },
        { name: 'Corporate Events', slug: 'corporate-events' },
        { name: 'Pre-Wedding', slug: 'pre-wedding' },
        { name: 'Fashion', slug: 'fashion' },
        { name: 'Maternity', slug: 'maternity' }
      ];
      await prisma.category.createMany({ data: categoriesData });
      
      const categories = await prisma.category.findMany();
      const catMap = {};
      categories.forEach(c => catMap[c.slug] = c.id);

      // 3. Create Services
      const servicesData = [
        { 
          title: 'Premium Wedding Package', 
          description: 'Full day luxury wedding coverage with two professional photographers.', 
          price: 250000, 
          deliverables: ['800+ Edited Photos', 'Printed Coffee Table Album', 'Drone Shots', 'Cinematic Highlight Video'],
          imageUrl: 'https://images.unsplash.com/photo-1511285560929-80b456fea0bc?q=80&w=800&auto=format&fit=crop',
          isActive: true
        },
        { 
          title: 'Pre-Wedding Shoot', 
          description: 'Golden hour romantic session.', 
          price: 50000, 
          deliverables: ['50 Edited High-Res Photos', '2 Outfit Changes', 'Short Teaser Reel'],
          imageUrl: 'https://images.unsplash.com/photo-1583939411023-14783179e581?q=80&w=800&auto=format&fit=crop',
          isActive: true
        },
        { 
          title: 'Corporate Event Coverage', 
          description: 'Professional coverage.', 
          price: 80000, 
          deliverables: ['200+ Edited Photos', 'Same Day Social Media Highlights'],
          imageUrl: 'https://images.unsplash.com/photo-1511578314322-379afb476865?q=80&w=800&auto=format&fit=crop',
          isActive: true
        },
        { 
          title: 'Grand Birthday Celebration', 
          description: 'Lively coverage.', 
          price: 40000, 
          deliverables: ['150+ Edited Photos', 'Candid Moments', 'Family Portraits'],
          imageUrl: 'https://images.unsplash.com/photo-1464366400600-7168b8af9bc3?q=80&w=800&auto=format&fit=crop',
          isActive: true
        },
        { 
          title: 'Fashion & Editorial Shoot', 
          description: 'Studio or location.', 
          price: 60000, 
          deliverables: ['30 Photos'],
          imageUrl: 'https://images.unsplash.com/photo-1469334031218-e382a71b716b?q=80&w=800&auto=format&fit=crop',
          isActive: true
        },
        { 
          title: 'Maternity Session', 
          description: 'Elegant and intimate session.', 
          price: 35000, 
          deliverables: ['40 Photos'],
          imageUrl: 'https://images.unsplash.com/photo-1519225421980-715cb0215aed?q=80&w=800&auto=format&fit=crop',
          isActive: true
        },
      ];
      await prisma.service.createMany({ data: servicesData });

      // 4. Create Gallery Images
      const galleryData = [
        { title: 'Summer Wedding', categoryId: catMap['weddings'], imageUrl: 'https://images.unsplash.com/photo-1511285560929-80b456fea0bc?q=80&w=800&auto=format&fit=crop', publicId: 'mock1', order: 0 },
        { title: 'Rustic Wedding', categoryId: catMap['weddings'], imageUrl: 'https://images.unsplash.com/photo-1465495976277-4387d4b0b4c6?q=80&w=800&auto=format&fit=crop', publicId: 'mock2', order: 1 },
        { title: 'Sweet 16 Birthday', categoryId: catMap['birthdays'], imageUrl: 'https://images.unsplash.com/photo-1464366400600-7168b8af9bc3?q=80&w=800&auto=format&fit=crop', publicId: 'mock4', order: 0 },
        { title: 'Corporate Gala', categoryId: catMap['corporate-events'], imageUrl: 'https://images.unsplash.com/photo-1511578314322-379afb476865?q=80&w=800&auto=format&fit=crop', publicId: 'mock6', order: 0 },
        { title: 'Golden Hour Pre-Wedding', categoryId: catMap['pre-wedding'], imageUrl: 'https://images.unsplash.com/photo-1583939411023-14783179e581?q=80&w=800&auto=format&fit=crop', publicId: 'mock8', order: 0 },
        { title: 'Vogue Fashion Shoot', categoryId: catMap['fashion'], imageUrl: 'https://images.unsplash.com/photo-1469334031218-e382a71b716b?q=80&w=800&auto=format&fit=crop', publicId: 'mock10', order: 0 },
        { title: 'Golden Hour Maternity', categoryId: catMap['maternity'], imageUrl: 'https://images.unsplash.com/photo-1516627145497-ae6968895b74?q=80&w=800&auto=format&fit=crop', publicId: 'mock21', order: 0 },
      ];
      await prisma.gallery.createMany({ data: galleryData });

      // 5. Create Settings
      await prisma.setting.create({
        data: {
          siteName: 'By Jonathan Studio',
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

      console.log('Prisma database seeding completed.');
    }
  } catch (err) {
    console.error('Seeding error:', err);
  }
}

// seedDatabase();

const app = express();

// Routes
const authRoutes = require('../src/routes/authRoutes');
const uploadRoutes = require('../src/routes/uploadRoutes');
const serviceRoutes = require('../src/routes/serviceRoutes');
const galleryRoutes = require('../src/routes/galleryRoutes');
const bookingRoutes = require('../src/routes/bookingRoutes');
const categoryRoutes = require('../src/routes/categoryRoutes');
const settingRoutes = require('../src/routes/settingRoutes');
const dashboardRoutes = require('../src/routes/dashboardRoutes');

// Middlewares
app.use(express.json());
app.use(cors({
  origin: function (origin, callback) {
    callback(null, true);
  },
  credentials: true
}));
app.use(helmet({
  crossOriginResourcePolicy: false
}));
app.use('/uploads', express.static(path.join(__dirname, '../uploads')));
if (process.env.NODE_ENV === 'development') {
  app.use(morgan('dev'));
}

app.use('/api/auth', authRoutes);
app.use('/api/upload', uploadRoutes);
app.use('/api/services', serviceRoutes);
app.use('/api/gallery', galleryRoutes);
app.use('/api/bookings', bookingRoutes);
app.use('/api/categories', categoryRoutes);
app.use('/api/settings', settingRoutes);
app.use('/api/dashboard', dashboardRoutes);

// Basic route
app.get('/', (req, res) => {
  res.send('JonathanPortfolio API is running...');
});

const PORT = process.env.PORT || 5000;

if (process.env.NODE_ENV !== 'production' || !process.env.VERCEL) {
  app.listen(PORT, () => {
    console.log(`Server running in ${process.env.NODE_ENV} mode on port ${PORT}`);
  });
}

module.exports = app;
