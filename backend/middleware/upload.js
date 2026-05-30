import fs from 'fs';
import path from 'path';
import multer from 'multer';
import { v2 as cloudinary } from 'cloudinary';
import { CloudinaryStorage } from 'multer-storage-cloudinary';

let storage;

if (process.env.CLOUDINARY_NAME && process.env.CLOUDINARY_API_KEY && process.env.CLOUDINARY_API_SECRET) {
  cloudinary.config({
    cloud_name: process.env.CLOUDINARY_NAME,
    api_key: process.env.CLOUDINARY_API_KEY,
    api_secret: process.env.CLOUDINARY_API_SECRET,
  });

  storage = new CloudinaryStorage({
    cloudinary,
    params: { folder: 'notesnest/notes', resource_type: 'auto' },
  });
} else {
  const uploadsPath = path.join(process.cwd(), 'uploads', 'notes');
  fs.mkdirSync(uploadsPath, { recursive: true });
  storage = multer.diskStorage({
    destination: uploadsPath,
    filename: (req, file, cb) => {
      const timestamp = Date.now();
      const safeName = file.originalname.replace(/[^a-zA-Z0-9.\-_]/g, '_');
      cb(null, `${timestamp}-${safeName}`);
    },
  });
}

export const uploadNotes = multer({ storage });
