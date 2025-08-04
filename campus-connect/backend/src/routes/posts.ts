import express from 'express';
import Post from '../models/Post';
import auth from '../middleware/auth';
import multer from 'multer';
import path from 'path';
import { AuthRequest } from '../types/auth';

const router = express.Router();

const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    cb(null, path.join(__dirname, '../../uploads/images'));
  },
  filename: (req, file, cb) => {
    const uniqueSuffix = Date.now() + '-' + Math.round(Math.random() * 1E9);
    cb(null, uniqueSuffix + path.extname(file.originalname));
  }
});

const upload = multer({ storage: storage });

router.post('/', auth, upload.single('image'), async (req: any, res) => {
  try {
    console.log('Creating post with file:', req.file); // Debug log
    
    if (!req.user?._id) {
      return res.status(401).json({ message: 'Unauthorized' });
    }

    const post = new Post({
      content: req.body.content,
      type: req.body.type,
      author: req.user._id,
      image: req.file ? `/uploads/images/${req.file.filename}` : undefined
    });

    await post.save();
    const populatedPost = await post.populate('author', 'name avatar role');
    console.log('Created post:', populatedPost);
    
    res.status(201).json(populatedPost);
  } catch (error: any) {
    console.error('Post creation error:', error);
    res.status(500).json({ 
      message: 'Error creating post', 
      error: error instanceof Error ? error.message : 'Unknown error' 
    });
  }
});

router.get('/feed', auth, async (req: AuthRequest, res) => {
  try {
    console.log('Fetching posts'); // Debug log
    const posts = await Post.find()
      .sort({ createdAt: -1 })
      .populate('author', 'name avatar role')
      .populate('comments.author', 'name avatar');
    
    console.log('Found posts:', posts); // Debug log
    res.json(posts);
  } catch (error: any) {
    console.error('Post fetch error:', error);
    res.status(500).json({ 
      message: 'Error fetching posts', 
      error: error instanceof Error ? error.message : 'Unknown error' 
    });
  }
});

export default router;
