import multer from 'multer';
import { GridFsStorage } from 'multer-gridfs-storage';
import crypto from 'crypto';
import path from 'path';
import dotenv from 'dotenv';

// Try to load .env file, but don't fail if it doesn't exist (for production)
try {
  dotenv.config({ path: path.resolve(__dirname, '../../.env') });
} catch (error) {
  console.log('No .env file found, using environment variables from system');
}

// Function to get MongoDB URI with better error handling
const getMongoDBURI = () => {
  const uri = process.env.MONGODB_URI;
  if (!uri) {
    throw new Error('MONGODB_URI must be defined in environment variables. Please check your deployment configuration.');
  }
  return uri;
};

export class FileUploadService {
  private static readonly ALLOWED_IMAGE_TYPES = /jpeg|jpg|png/;
  private static readonly ALLOWED_DOCUMENT_TYPES = /pdf|doc|docx/;
  
  static createStorage(type: 'image' | 'resume' | 'avatar') {
    return new GridFsStorage({
      url: getMongoDBURI(),
      options: { useNewUrlParser: true, useUnifiedTopology: true },
      file: (req, file) => {
        return new Promise((resolve, reject) => {
          crypto.randomBytes(16, (err, buf) => {
            if (err) return reject(err);
            
            const filename = `${type}-${buf.toString('hex')}${path.extname(file.originalname)}`;
            const fileInfo = {
              filename,
              bucketName: `${type}s`
            };
            resolve(fileInfo);
          });
        });
      }
    });
  }

  static getUploader(type: 'image' | 'resume' | 'avatar') {
    const storage = this.createStorage(type);
    const fileFilter = (req: any, file: any, cb: any) => {
      const allowedTypes = type === 'image' || type === 'avatar' 
        ? this.ALLOWED_IMAGE_TYPES 
        : this.ALLOWED_DOCUMENT_TYPES;
        
      const valid = allowedTypes.test(path.extname(file.originalname).toLowerCase());
      cb(null, valid);
    };

    return multer({
      storage,
      limits: { fileSize: type === 'resume' ? 10 * 1024 * 1024 : 5 * 1024 * 1024 },
      fileFilter
    });
  }
}
