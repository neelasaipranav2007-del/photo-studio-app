const mongoose = require('mongoose');
const dotenv = require('dotenv');
const User = require('./models/User');
const Category = require('./models/Category');
const Gallery = require('./models/Gallery');
const Service = require('./models/Service');
const connectDB = require('./config/db');

const path = require('path');
dotenv.config({ path: path.resolve(__dirname, '../.env') });

connectDB();

const importData = async () => {
  try {
    await User.deleteMany();
    await Category.deleteMany();
    await Gallery.deleteMany();
    await Service.deleteMany();

    // 1. Create Admin
    const adminUser = await User.create({
      name: 'Jonathan Admin',
      email: 'admin@jonathanportfolio.com',
      password: 'Password123',
      role: 'admin',
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
    const createdCategories = await Category.insertMany(categoriesData);

    const getCatId = (name) => createdCategories.find(c => c.name === name)._id;

    // 3. Create Gallery
    const galleryData = [
      // Weddings (4)
      { title: 'Summer Wedding', category: getCatId('Weddings'), imageUrl: 'https://images.unsplash.com/photo-1511285560929-80b456fea0bc?q=80&w=800&auto=format&fit=crop', publicId: 'mock' },
      { title: 'Rustic Wedding', category: getCatId('Weddings'), imageUrl: 'https://images.unsplash.com/photo-1465495976277-4387d4b0b4c6?q=80&w=800&auto=format&fit=crop', publicId: 'mock' },
      { title: 'Beach Wedding', category: getCatId('Weddings'), imageUrl: 'https://images.unsplash.com/photo-1583939003579-730e3918a45a?q=80&w=800&auto=format&fit=crop', publicId: 'mock' },
      { title: 'Traditional Wedding', category: getCatId('Weddings'), imageUrl: 'https://images.unsplash.com/photo-1519741497674-611481863552?q=80&w=800&auto=format&fit=crop', publicId: 'mock' },
      
      // Birthdays (4)
      { title: 'Sweet 16 Birthday', category: getCatId('Birthdays'), imageUrl: 'https://images.unsplash.com/photo-1464366400600-7168b8af9bc3?q=80&w=800&auto=format&fit=crop', publicId: 'mock' },
      { title: 'Grand 50th Birthday', category: getCatId('Birthdays'), imageUrl: 'https://images.unsplash.com/photo-1527529482837-4698179dc6ce?q=80&w=800&auto=format&fit=crop', publicId: 'mock' },
      { title: 'Kids Birthday Party', category: getCatId('Birthdays'), imageUrl: 'https://images.unsplash.com/photo-1504196606672-aef5c9cefc92?q=80&w=800&auto=format&fit=crop', publicId: 'mock' },
      { title: 'Surprise Birthday', category: getCatId('Birthdays'), imageUrl: 'https://images.unsplash.com/photo-1533174072545-7a4b6ad7a6c3?q=80&w=800&auto=format&fit=crop', publicId: 'mock' },
      
      // Corporate Events (4)
      { title: 'Corporate Gala', category: getCatId('Corporate Events'), imageUrl: 'https://images.unsplash.com/photo-1511578314322-379afb476865?q=80&w=800&auto=format&fit=crop', publicId: 'mock' },
      { title: 'Business Summit', category: getCatId('Corporate Events'), imageUrl: 'https://images.unsplash.com/photo-1505373877841-8d25f7d46678?q=80&w=800&auto=format&fit=crop', publicId: 'mock' },
      { title: 'Tech Conference', category: getCatId('Corporate Events'), imageUrl: 'https://images.unsplash.com/photo-1540575467063-178a50c2df87?q=80&w=800&auto=format&fit=crop', publicId: 'mock' },
      { title: 'Awards Night', category: getCatId('Corporate Events'), imageUrl: 'https://images.unsplash.com/photo-1515169067868-5387ec356754?q=80&w=800&auto=format&fit=crop', publicId: 'mock' },
      
      // Pre-Wedding (4)
      { title: 'Golden Hour Pre-Wedding', category: getCatId('Pre-Wedding'), imageUrl: 'https://images.unsplash.com/photo-1583939411023-14783179e581?q=80&w=800&auto=format&fit=crop', publicId: 'mock' },
      { title: 'City Lights Pre-Wedding', category: getCatId('Pre-Wedding'), imageUrl: 'https://images.unsplash.com/photo-1606800052052-a08af7148866?q=80&w=800&auto=format&fit=crop', publicId: 'mock' },
      { title: 'Mountain Pre-Wedding', category: getCatId('Pre-Wedding'), imageUrl: 'https://images.unsplash.com/photo-1519225421980-715cb0215aed?q=80&w=800&auto=format&fit=crop', publicId: 'mock' },
      { title: 'Lake Side Romance', category: getCatId('Pre-Wedding'), imageUrl: 'https://images.unsplash.com/photo-1532712938310-34cb3982ef74?q=80&w=800&auto=format&fit=crop', publicId: 'mock' },
      
      // Fashion (4)
      { title: 'Vogue Fashion Shoot', category: getCatId('Fashion'), imageUrl: 'https://images.unsplash.com/photo-1469334031218-e382a71b716b?q=80&w=800&auto=format&fit=crop', publicId: 'mock' },
      { title: 'Street Style', category: getCatId('Fashion'), imageUrl: 'https://images.unsplash.com/photo-1515886657613-9f3515b0c78f?q=80&w=800&auto=format&fit=crop', publicId: 'mock' },
      { title: 'Studio Editorial', category: getCatId('Fashion'), imageUrl: 'https://images.unsplash.com/photo-1539109136881-3be0616acf4b?q=80&w=800&auto=format&fit=crop', publicId: 'mock' },
      { title: 'High Fashion', category: getCatId('Fashion'), imageUrl: 'https://images.unsplash.com/photo-1496345875659-11f7dd282d1d?q=80&w=800&auto=format&fit=crop', publicId: 'mock' },
      
      // Maternity (4)
      { title: 'Golden Hour Maternity', category: getCatId('Maternity'), imageUrl: 'https://images.unsplash.com/photo-1516627145497-ae6968895b74?q=80&w=800&auto=format&fit=crop', publicId: 'mock' },
      { title: 'Intimate Moments', category: getCatId('Maternity'), imageUrl: 'https://images.unsplash.com/photo-1551590192-8070a16d9f67?q=80&w=800&auto=format&fit=crop', publicId: 'mock' },
      { title: 'Classic Maternity Portrait', category: getCatId('Maternity'), imageUrl: 'https://images.unsplash.com/photo-1519225421980-715cb0215aed?q=80&w=800&auto=format&fit=crop', publicId: 'mock' },
      { title: 'Sunset Pregnancy Portrait', category: getCatId('Maternity'), imageUrl: 'https://images.unsplash.com/photo-1559839914-17aae19cec71?q=80&w=800&auto=format&fit=crop', publicId: 'mock' }
    ];
    await Gallery.insertMany(galleryData);

    // 4. Create Services
    const serviceData = [
      { title: 'Premium Wedding Package', description: 'Full day luxury wedding coverage with two professional photographers.', price: 250000, imageUrl: 'https://images.unsplash.com/photo-1511285560929-80b456fea0bc?q=80&w=800&auto=format&fit=crop', deliverables: ['800+ Edited Photos', 'Printed Coffee Table Album', 'Drone Shots', 'Cinematic Highlight Video'] },
      { title: 'Pre-Wedding Shoot', description: 'Golden hour romantic session at premium outdoor locations.', price: 50000, imageUrl: 'https://images.unsplash.com/photo-1583939411023-14783179e581?q=80&w=800&auto=format&fit=crop', deliverables: ['50 Edited High-Res Photos', '2 Outfit Changes', 'Short Teaser Reel'] },
      { title: 'Corporate Event Coverage', description: 'Professional coverage for business summits, award shows, and galas.', price: 80000, imageUrl: 'https://images.unsplash.com/photo-1511578314322-379afb476865?q=80&w=800&auto=format&fit=crop', deliverables: ['200+ Edited Photos', 'Same Day Social Media Highlights'] },
      { title: 'Grand Birthday Celebration', description: 'Lively coverage for milestone birthdays and kids parties.', price: 40000, imageUrl: 'https://images.unsplash.com/photo-1464366400600-7168b8af9bc3?q=80&w=800&auto=format&fit=crop', deliverables: ['150+ Edited Photos', 'Candid Moments', 'Family Portraits'] },
      { title: 'Fashion & Editorial Shoot', description: 'Studio or location shoot with professional lighting setup.', price: 60000, imageUrl: 'https://images.unsplash.com/photo-1469334031218-e382a71b716b?q=80&w=800&auto=format&fit=crop', deliverables: ['30 Retouched Magazine-Ready Photos', 'Styling Consultation'] },
      { title: 'Maternity Session', description: 'Elegant and intimate session to capture this beautiful journey.', price: 35000, imageUrl: 'https://images.unsplash.com/photo-1519225421980-715cb0215aed?q=80&w=800&auto=format&fit=crop', deliverables: ['40 Edited Photos', 'Props Provided'] },
    ];
    await Service.insertMany(serviceData);

    console.log('Data Imported!');
    process.exit();
  } catch (error) {
    console.error(`Error with seeding: ${error.message}`);
    process.exit(1);
  }
};

importData();
