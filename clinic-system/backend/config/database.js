const mongoose = require('mongoose');

const dbConfig = {
  connect: async () => {
    try {
      const conn = await mongoose.connect(process.env.MONGODB_URI || 'mongodb://localhost:27017/family_clinic', {
        useNewUrlParser: true,
        useUnifiedTopology: true,
      });
      console.log(`MongoDB Connected: ${conn.connection.host}`);
      return conn;
    } catch (error) {
      console.error(`Database connection error: ${error.message}`);
      process.exit(1);
    }
  },
  
  disconnect: async () => {
    try {
      await mongoose.disconnect();
      console.log('MongoDB Disconnected');
    } catch (error) {
      console.error(`Database disconnection error: ${error.message}`);
    }
  }
};

module.exports = dbConfig;
