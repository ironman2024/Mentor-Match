import express from 'express';
import auth from '../middleware/auth';
import { upload, saveImageMetadata, getImage } from '../services/ImageService';
import Image from '../models/Image';

const router = express.Router();

router.post('/upload', auth, upload.single('image'), async (req: any, res) => {
  try {
    if (!req.file) {
      return res.status(400).json({ message: 'No file uploaded' });
    }

    const image = await saveImageMetadata(req.file, req.user._id);
    res.json(image);
  } catch (error: any) {
    res.status(500).json({ message: error.message });
  }
});

router.get('/:filename', async (req, res) => {
  try {
    const stream = await getImage(req.params.filename);
    stream.pipe(res);
  } catch (error: any) {
    res.status(404).json({ message: 'Image not found' });
  }
});

export default router;
