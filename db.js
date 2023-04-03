import dotenv from 'dotenv';
import express from 'express';
import mongoose from 'mongoose';

dotenv.config({ path: '.env.local' });

export const connectDB = (handler) => async (req, res) => {
  console.log('Connecting to database...');

  try {
    await mongoose.connect(process.env.MONGODB_URI, {
      useNewUrlParser: true,
      useUnifiedTopology: true,
      dbName: process.env.NODE_ENV == 'production' ? 'prod' : 'test'
    });
    console.log('Connected to database!');
  } catch (error) {
    console.error('Error connecting to database:', error);
    return res.status(500).json({ message: 'Database connection error.' });
  }
  return handler(req, res)
};

export default connectDB;