const mongoose = require('mongoose');
const config = require('./index');

const connectDB = async () => {
  let retries = 5;
  while (retries) {
    try {
      await mongoose.connect(config.mongoUri, {
        useNewUrlParser: true,
        useUnifiedTopology: true,
      });
      console.log('MongoDB connected successfully');
      break;
    } catch (err) {
      console.error(`MongoDB connection error. Retries left: ${retries - 1}`, err);
      retries -= 1;
      await new Promise(res => setTimeout(res, 5000));
    }
  }
  if (!retries) {
    console.error('MongoDB connection failed after all retries');
    process.exit(1);
  }
};

mongoose.connection.on('disconnected', () => {
  console.log('MongoDB disconnected');
});

mongoose.connection.on('error', (err) => {
  console.error('MongoDB connection error event:', err);
});

module.exports = connectDB;
