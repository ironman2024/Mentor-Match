import express from 'express';
import auth from '../middleware/auth';
import UserProfile from '../models/UserProfile';
import Post from '../models/Post';
import User from '../models/User';
import multer from 'multer';
import path from 'path';

const router = express.Router();

const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    cb(null, path.join(__dirname, '../../uploads/images'));
  },
  filename: (req, file, cb) => {
    const uniqueSuffix = `${Date.now()}-${Math.round(Math.random() * 1E9)}`;
    const ext = path.extname(file.originalname);
    cb(null, `avatar-${uniqueSuffix}${ext}`);
  }
});

const upload = multer({ 
  storage,
  limits: { fileSize: 5 * 1024 * 1024 }, // 5MB limit
  fileFilter: (req, file, cb) => {
    const allowedTypes = /jpeg|jpg|png/;
    const valid = allowedTypes.test(path.extname(file.originalname).toLowerCase());
    cb(null, valid);
  }
});

// Get user profile
router.get('/user/:userId', auth, async (req, res) => {
  try {
    console.log('Fetching profile for user:', req.params.userId);
    
    if (!req.params.userId) {
      return res.status(400).json({ message: 'User ID is required' });
    }

    const userProfile = await UserProfile.findOne({ user: req.params.userId })
      .populate('user', 'name email avatar role bio skills linkedin github');

    if (!userProfile) {
      // If no profile exists, return user data only
      const userData = await User.findById(req.params.userId)
        .select('name email avatar role bio skills linkedin github');
      
      if (!userData) {
        return res.status(404).json({ message: 'User not found' });
      }

      return res.json({
        user: userData,
        department: '',
        yearOfGraduation: '',
        experiences: []
      });
    }

    res.json(userProfile);
  } catch (error: any) {
    console.error('Profile fetch error:', error);
    res.status(500).json({ 
      message: 'Error fetching profile',
      error: error.message 
    });
  }
});

// Add new route for avatar upload
router.post('/avatar', auth, upload.single('avatar'), async (req: any, res) => {
  try {
    if (!req.file) {
      return res.status(400).json({ message: 'No file uploaded' });
    }

    const user = await User.findById(req.user._id);
    if (!user) {
      return res.status(404).json({ message: 'User not found' });
    }

    const avatarUrl = `/uploads/images/${req.file.filename}`;
    user.avatar = avatarUrl;
    await user.save();

    res.json({ 
      url: avatarUrl,
      message: 'Avatar uploaded successfully' 
    });
  } catch (error: any) {
    console.error('Avatar upload error:', error);
    res.status(500).json({ message: error.message });
  }
});

// Update profile
router.put('/', auth, async (req: any, res) => {
  try {
    console.log('Updating profile. Body:', req.body);
    console.log('Auth user:', req.user);

    if (!req.user?._id) {
      return res.status(401).json({ message: 'User not authenticated' });
    }

    // Find or create profile
    let profile = await UserProfile.findOne({ user: req.user._id });
    const user = await User.findById(req.user._id);

    if (!user) {
      return res.status(404).json({ message: 'User not found' });
    }

    // Update user model fields
    user.name = req.body.name;
    user.bio = req.body.bio;
    user.skills = req.body.skills;
    user.linkedin = req.body.linkedin;
    user.github = req.body.github;
    await user.save();

    if (!profile) {
      profile = new UserProfile({
        user: req.user._id,
        department: req.body.department,
        yearOfGraduation: req.body.yearOfGraduation,
        experiences: req.body.experiences || []
      });
    } else {
      profile.department = req.body.department;
      profile.yearOfGraduation = req.body.yearOfGraduation;
      profile.experiences = req.body.experiences || [];
    }

    await profile.save();
    
    const updatedProfile = await UserProfile.findOne({ user: req.user._id })
      .populate('user', 'name email avatar role bio skills linkedin github');

    res.json(updatedProfile);
  } catch (error: any) {
    console.error('Profile update error:', error);
    res.status(500).json({ 
      message: 'Error updating profile',
      error: error.message 
    });
  }
});

export default router;
