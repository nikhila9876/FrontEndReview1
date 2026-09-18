import mongoose from 'mongoose';

/**
 * Connect to MongoDB database
 * Note: Per project requirements, this is not automatically invoked on startup.
 * To enable MongoDB connection in your project, call connectDB() in src/server.js
 * and provide your valid MONGO_URI in .env
 */
export const connectDB = async () => {
  try {
    const mongoUri = process.env.MONGO_URI;

    if (!mongoUri) {
      console.warn('⚠️ MONGO_URI not defined in environment variables. Database not connected.');
      return null;
    }

    const conn = await mongoose.connect(mongoUri);
    console.log(`✅ MongoDB Connected: ${conn.connection.host}`);
    return conn;
  } catch (error) {
    console.error(`❌ MongoDB Connection Error: ${error.message}`);
    process.exit(1);
  }
};

export default connectDB;
