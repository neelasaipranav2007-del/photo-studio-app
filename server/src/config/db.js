const mongoose = require('mongoose');
const { MongoMemoryServer } = require('mongodb-memory-server');
const fs = require('fs');
const path = require('path');

const connectDB = async () => {
  try {
    let uri = process.env.MONGO_URI;
    
    // Fallback to in-memory DB if no URI or local URI is provided and fails
    if (!uri || uri.includes('127.0.0.1') || uri.includes('localhost')) {
      console.log('Starting MongoDB Memory Server as fallback...');
      
      let opts = {};
      
      // Determine if we should use D: or E: drive due to low space on C:
      let tempDir = null;
      const drivesToTry = ['D:\\mongodb_temp', 'E:\\mongodb_temp'];
      for (const drivePath of drivesToTry) {
        try {
          fs.mkdirSync(drivePath, { recursive: true });
          // Test if we can write a test file to ensure it's writable
          const testFile = path.join(drivePath, `.write_test_${Date.now()}`);
          fs.writeFileSync(testFile, 'test');
          fs.unlinkSync(testFile);
          
          tempDir = path.join(drivePath, `mongo-mem-${Date.now()}-${Math.random().toString(36).substring(2, 7)}`);
          fs.mkdirSync(tempDir, { recursive: true });
          break;
        } catch (e) {
          // Drive not writable or doesn't exist, try next
        }
      }
      
      if (tempDir) {
        console.log(`Using custom temp database path: ${tempDir}`);
        opts.instance = {
          dbPath: tempDir
        };
        
        // Clean up on exit
        const cleanUp = () => {
          try {
            if (fs.existsSync(tempDir)) {
              fs.rmSync(tempDir, { recursive: true, force: true });
            }
          } catch (err) {
            // Ignore clean up errors
          }
        };
        process.on('exit', cleanUp);
        process.on('SIGINT', () => {
          cleanUp();
          process.exit(0);
        });
        process.on('SIGTERM', () => {
          cleanUp();
          process.exit(0);
        });
      } else {
        console.log('Using default system temp directory for MongoDB Memory Server');
      }

      const mongoServer = await MongoMemoryServer.create(opts);
      uri = mongoServer.getUri();
    }

    const conn = await mongoose.connect(uri);
    console.log(`MongoDB Connected: ${conn.connection.host}`);
  } catch (error) {
    console.error(`Error: ${error.message}`);
    process.exit(1);
  }
};

module.exports = connectDB;
