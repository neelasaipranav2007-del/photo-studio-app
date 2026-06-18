const express = require('express');
const dotenv = require('dotenv');
const cors = require('cors');
const helmet = require('helmet');
const morgan = require('morgan');
const path = require('path');
const connectDB = require('./config/db');

// Load env vars
dotenv.config();

// Connect to database
connectDB().then(async () => {
  // If memory server, seed database
  if (!process.env.MONGO_URI || process.env.MONGO_URI.includes('127.0.0.1')) {
    const Service = require('./models/Service');
    const User = require('./models/User');
    const Category = require('./models/Category');
    const Gallery = require('./models/Gallery');
    const Setting = require('./models/Setting');

    const serviceCount = await Service.countDocuments();
    if (serviceCount === 0) {
      console.log('Seeding memory database...');

      // 1. Create Admin User (Plain text password: User model pre-save hook hashes it)
      await User.create({
        _id: '60d5ec49b1a53b2d1c67d3d1',
        name: 'Jonathan Admin',
        email: 'admin@jonathanportfolio.com',
        password: 'admin123',
        role: 'admin'
      });

      // 2. Create Categories
      const categoriesData = [
        { _id: '60d5ec49b1a53b2d1c67d3c1', name: 'Weddings', slug: 'weddings' },
        { _id: '60d5ec49b1a53b2d1c67d3c2', name: 'Birthdays', slug: 'birthdays' },
        { _id: '60d5ec49b1a53b2d1c67d3c3', name: 'Corporate Events', slug: 'corporate-events' },
        { _id: '60d5ec49b1a53b2d1c67d3c4', name: 'Pre-Wedding', slug: 'pre-wedding' },
        { _id: '60d5ec49b1a53b2d1c67d3c5', name: 'Fashion', slug: 'fashion' },
        { _id: '60d5ec49b1a53b2d1c67d3c6', name: 'Maternity', slug: 'maternity' }
      ];
      await Category.insertMany(categoriesData);

      // 3. Create Services
      const servicesData = [
        { 
          _id: '60d5ec49b1a53b2d1c67d3e1', 
          title: 'Premium Wedding Package', 
          description: 'Full day luxury wedding coverage with two professional photographers.', 
          price: 250000, 
          deliverables: ['800+ Edited Photos', 'Printed Coffee Table Album', 'Drone Shots', 'Cinematic Highlight Video'],
          imageUrl: 'https://images.unsplash.com/photo-1511285560929-80b456fea0bc?q=80&w=800&auto=format&fit=crop',
          isActive: true
        },
        { 
          _id: '60d5ec49b1a53b2d1c67d3e2', 
          title: 'Pre-Wedding Shoot', 
          description: 'Golden hour romantic session.', 
          price: 50000, 
          deliverables: ['50 Edited High-Res Photos', '2 Outfit Changes', 'Short Teaser Reel'],
          imageUrl: 'https://images.unsplash.com/photo-1583939411023-14783179e581?q=80&w=800&auto=format&fit=crop',
          isActive: true
        },
        { 
          _id: '60d5ec49b1a53b2d1c67d3e3', 
          title: 'Corporate Event Coverage', 
          description: 'Professional coverage.', 
          price: 80000, 
          deliverables: ['200+ Edited Photos', 'Same Day Social Media Highlights'],
          imageUrl: 'https://images.unsplash.com/photo-1511578314322-379afb476865?q=80&w=800&auto=format&fit=crop',
          isActive: true
        },
        { 
          _id: '60d5ec49b1a53b2d1c67d3e4', 
          title: 'Grand Birthday Celebration', 
          description: 'Lively coverage.', 
          price: 40000, 
          deliverables: ['150+ Edited Photos', 'Candid Moments', 'Family Portraits'],
          imageUrl: 'https://images.unsplash.com/photo-1464366400600-7168b8af9bc3?q=80&w=800&auto=format&fit=crop',
          isActive: true
        },
        { 
          _id: '60d5ec49b1a53b2d1c67d3e5', 
          title: 'Fashion & Editorial Shoot', 
          description: 'Studio or location.', 
          price: 60000, 
          deliverables: ['30 Photos'],
          imageUrl: 'https://images.unsplash.com/photo-1469334031218-e382a71b716b?q=80&w=800&auto=format&fit=crop',
          isActive: true
        },
        { 
          _id: '60d5ec49b1a53b2d1c67d3e6', 
          title: 'Maternity Session', 
          description: 'Elegant and intimate session.', 
          price: 35000, 
          deliverables: ['40 Photos'],
          imageUrl: 'https://images.unsplash.com/photo-1519225421980-715cb0215aed?q=80&w=800&auto=format&fit=crop',
          isActive: true
        },
      ];
      await Service.insertMany(servicesData);

      // 4. Create Gallery Images
      const galleryData = [
        // Weddings (4)
        { title: 'Summer Wedding', category: '60d5ec49b1a53b2d1c67d3c1', imageUrl: 'https://images.unsplash.com/photo-1511285560929-80b456fea0bc?q=80&w=800&auto=format&fit=crop', publicId: 'mock1', order: 0 },
        { title: 'Rustic Wedding', category: '60d5ec49b1a53b2d1c67d3c1', imageUrl: 'https://images.unsplash.com/photo-1465495976277-4387d4b0b4c6?q=80&w=800&auto=format&fit=crop', publicId: 'mock2', order: 1 },
        { title: 'Beach Wedding', category: '60d5ec49b1a53b2d1c67d3c1', imageUrl: 'https://images.unsplash.com/photo-1583939003579-730e3918a45a?q=80&w=800&auto=format&fit=crop', publicId: 'mock3', order: 2 },
        { title: 'Traditional Wedding', category: '60d5ec49b1a53b2d1c67d3c1', imageUrl: 'https://images.unsplash.com/photo-1519741497674-611481863552?q=80&w=800&auto=format&fit=crop', publicId: 'mock12', order: 3 },
        
        // Birthdays (4)
        { title: 'Sweet 16 Birthday', category: '60d5ec49b1a53b2d1c67d3c2', imageUrl: 'https://images.unsplash.com/photo-1464366400600-7168b8af9bc3?q=80&w=800&auto=format&fit=crop', publicId: 'mock4', order: 0 },
        { title: 'Kids Birthday Party', category: '60d5ec49b1a53b2d1c67d3c2', imageUrl: 'https://images.unsplash.com/photo-1504196606672-aef5c9cefc92?q=80&w=800&auto=format&fit=crop', publicId: 'mock5', order: 1 },
        { title: 'Surprise Birthday', category: '60d5ec49b1a53b2d1c67d3c2', imageUrl: 'https://images.unsplash.com/photo-1533174072545-7a4b6ad7a6c3?q=80&w=800&auto=format&fit=crop', publicId: 'mock13', order: 2 },
        { title: 'Grand 50th Birthday', category: '60d5ec49b1a53b2d1c67d3c2', imageUrl: 'https://images.unsplash.com/photo-1527529482837-4698179dc6ce?q=80&w=800&auto=format&fit=crop', publicId: 'mock14', order: 3 },
        
        // Corporate Events (4)
        { title: 'Corporate Gala', category: '60d5ec49b1a53b2d1c67d3c3', imageUrl: 'https://images.unsplash.com/photo-1511578314322-379afb476865?q=80&w=800&auto=format&fit=crop', publicId: 'mock6', order: 0 },
        { title: 'Business Summit', category: '60d5ec49b1a53b2d1c67d3c3', imageUrl: 'https://images.unsplash.com/photo-1505373877841-8d25f7d46678?q=80&w=800&auto=format&fit=crop', publicId: 'mock7', order: 1 },
        { title: 'Tech Conference', category: '60d5ec49b1a53b2d1c67d3c3', imageUrl: 'https://images.unsplash.com/photo-1540575467063-178a50c2df87?q=80&w=800&auto=format&fit=crop', publicId: 'mock15', order: 2 },
        { title: 'Awards Night', category: '60d5ec49b1a53b2d1c67d3c3', imageUrl: 'https://images.unsplash.com/photo-1515169067868-5387ec356754?q=80&w=800&auto=format&fit=crop', publicId: 'mock16', order: 3 },
        
        // Pre-Wedding (4)
        { title: 'Golden Hour Pre-Wedding', category: '60d5ec49b1a53b2d1c67d3c4', imageUrl: 'https://images.unsplash.com/photo-1583939411023-14783179e581?q=80&w=800&auto=format&fit=crop', publicId: 'mock8', order: 0 },
        { title: 'City Lights Pre-Wedding', category: '60d5ec49b1a53b2d1c67d3c4', imageUrl: 'https://images.unsplash.com/photo-1606800052052-a08af7148866?q=80&w=800&auto=format&fit=crop', publicId: 'mock9', order: 1 },
        { title: 'Mountain Pre-Wedding', category: '60d5ec49b1a53b2d1c67d3c4', imageUrl: 'https://images.unsplash.com/photo-1519225421980-715cb0215aed?q=80&w=800&auto=format&fit=crop', publicId: 'mock17', order: 2 },
        { title: 'Lake Side Romance', category: '60d5ec49b1a53b2d1c67d3c4', imageUrl: 'https://images.unsplash.com/photo-1532712938310-34cb3982ef74?q=80&w=800&auto=format&fit=crop', publicId: 'mock18', order: 3 },
        
        // Fashion (4)
        { title: 'Vogue Fashion Shoot', category: '60d5ec49b1a53b2d1c67d3c5', imageUrl: 'https://images.unsplash.com/photo-1469334031218-e382a71b716b?q=80&w=800&auto=format&fit=crop', publicId: 'mock10', order: 0 },
        { title: 'Street Style', category: '60d5ec49b1a53b2d1c67d3c5', imageUrl: 'https://images.unsplash.com/photo-1515886657613-9f3515b0c78f?q=80&w=800&auto=format&fit=crop', publicId: 'mock11', order: 1 },
        { title: 'Studio Editorial', category: '60d5ec49b1a53b2d1c67d3c5', imageUrl: 'https://images.unsplash.com/photo-1539109136881-3be0616acf4b?q=80&w=800&auto=format&fit=crop', publicId: 'mock19', order: 2 },
        { title: 'High Fashion', category: '60d5ec49b1a53b2d1c67d3c5', imageUrl: 'https://images.unsplash.com/photo-1496345875659-11f7dd282d1d?q=80&w=800&auto=format&fit=crop', publicId: 'mock20', order: 3 },
        
        // Maternity (4)
        { title: 'Golden Hour Maternity', category: '60d5ec49b1a53b2d1c67d3c6', imageUrl: 'https://images.unsplash.com/photo-1516627145497-ae6968895b74?q=80&w=800&auto=format&fit=crop', publicId: 'mock21', order: 0 },
        { title: 'Intimate Moments', category: '60d5ec49b1a53b2d1c67d3c6', imageUrl: 'https://images.unsplash.com/photo-1551590192-8070a16d9f67?q=80&w=800&auto=format&fit=crop', publicId: 'mock22', order: 1 },
        { title: 'Classic Maternity Portrait', category: '60d5ec49b1a53b2d1c67d3c6', imageUrl: 'https://images.unsplash.com/photo-1519225421980-715cb0215aed?q=80&w=800&auto=format&fit=crop', publicId: 'mock23', order: 2 },
        { title: 'Sunset Pregnancy Portrait', category: '60d5ec49b1a53b2d1c67d3c6', imageUrl: 'https://images.unsplash.com/photo-1559839914-17aae19cec71?q=80&w=800&auto=format&fit=crop', publicId: 'mock24', order: 3 }
      ];
      await Gallery.insertMany(galleryData);

      // 5. Create Settings
      await Setting.create({
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
      });

      console.log('Memory database seeding completed.');
    }
  }
});

const app = express();

// Routes
const authRoutes = require('./routes/authRoutes');
const uploadRoutes = require('./routes/uploadRoutes');
const serviceRoutes = require('./routes/serviceRoutes');
const galleryRoutes = require('./routes/galleryRoutes');
const bookingRoutes = require('./routes/bookingRoutes');
const categoryRoutes = require('./routes/categoryRoutes');
const settingRoutes = require('./routes/settingRoutes');
const dashboardRoutes = require('./routes/dashboardRoutes');

// Middlewares
app.use(express.json());
app.use(cors({
  origin: process.env.CLIENT_URL || '*',
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

app.listen(PORT, () => {
  console.log(`Server running in ${process.env.NODE_ENV} mode on port ${PORT}`);
});
