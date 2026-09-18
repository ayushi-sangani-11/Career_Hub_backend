const mongoose = require('mongoose');

const connectDB = async () => {
  try {
    const conn = await mongoose.connect(process.env.MONGODB_URI || 'mongodb://127.0.0.1:27017/smart_careerhub', {
      serverSelectionTimeoutMS: 5000
    });
    console.log(`[MongoDB Connected]: ${conn.connection.host}`);
    return true;
  } catch (error) {
    console.error(`[MongoDB Connection Error]: ${error.message}`);
    console.warn(`[MongoDB Warning]: Ensure MongoDB service is running on ${process.env.MONGODB_URI || 'mongodb://127.0.0.1:27017/smart_careerhub'}. Running with error handling fallback mode if DB calls fail.`);
    return false;
  }
};

module.exports = connectDB;
