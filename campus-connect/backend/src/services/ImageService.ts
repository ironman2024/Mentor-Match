import multer from 'multer';
import { GridFsStorage } from 'multer-gridfs-storage';
import mongoose from 'mongoose';
import crypto from 'crypto';
import path from 'path';
import Image from '../models/Image';
import dotenv from 'dotenv';

dotenv.config();

if (!process.env.MONGODB_URI) {
  throw new Error('MONGODB_URI must be defined in environment variables');
}

const storage = new GridFsStorage({
  url: process.env.MONGODB_URI,
  options: {
    useNewUrlParser: true,
    useUnifiedTopology: true
  },
  file: (req, file) => {
    return new Promise((resolve, reject) => {
      crypto.randomBytes(16, (err, buf) => {
        if (err) {
          return reject(err);
        }
        const filename = buf.toString('hex') + path.extname(file.originalname);
        const fileInfo = {
          filename: filename,
          bucketName: 'uploads'
        };
        resolve(fileInfo);
      });
    });
  }
});

// Handle storage errors
storage.on('connectionError', (error) => {
  console.error('GridFS Storage connection error:', error);
});

const upload = multer({ 
  storage,
  limits: { fileSize: 5 * 1024 * 1024 } // 5MB limit
});

const saveImageMetadata = async (file: Express.Multer.File, userId: string) => {
  const image = new Image({
    filename: file.filename,
    originalName: file.originalname,
    mimetype: file.mimetype,
    size: file.size,
    url: `/api/images/${file.filename}`,
    uploadedBy: userId
  });
  return await image.save();
};

const getImage = async (filename: string) => {
  const bucket = new mongoose.mongo.GridFSBucket(mongoose.connection.db, {
    bucketName: 'uploads'
  });
  return bucket.openDownloadStreamByName(filename);
};

export { upload, saveImageMetadata, getImage };
