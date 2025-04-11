import express from 'express';
import auth from '../middleware/auth';
import UserProfile from '../models/UserProfile';
import User, { IUser } from '../models/User';
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
    const userProfile = await UserProfile.findOne({ user: req.params.userId })
      .populate<{ user: IUser }>('user', 'name email avatar role bio skills linkedin github');

    if (!userProfile) {
      // If no profile exists, return user data only
      const userData = await User.findById(req.params.userId)
        .select('name email avatar role bio skills linkedin github')
        .lean();
      
      if (!userData) {
        return res.status(404).json({ message: 'User not found' });
      }

      // Transform skills data
      const formattedSkills = Array.isArray(userData.skills) 
        ? userData.skills.map((skill: any) => 
            typeof skill === 'object' ? skill.name : skill
          )
        : [];

      return res.json({
        user: {
          ...userData,
          skills: formattedSkills
        },
        department: '',
        yearOfGraduation: '',
        experiences: []
      });
    }

    // Transform populated user data
    const transformedUser = {
      ...userProfile.user.toObject(),
      skills: Array.isArray(userProfile.user.skills) 
        ? userProfile.user.skills.map((skill: any) => 
            typeof skill === 'object' ? skill.name : skill
          )
        : []
    };

    // Create the response object
    const responseData = {
      ...userProfile.toObject(),
      user: transformedUser
    };

    res.json(responseData);
  } catch (error: any) {
    console.error('Profile fetch error:', error);
    res.status(500).json({ message: error.message });
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
    if (!req.user?._id) {
      return res.status(401).json({ message: 'User not authenticated' });
    }

    // Find or create profile
    let profile = await UserProfile.findOne({ user: req.user._id });
    const user = await User.findById(req.user._id);

    if (!user) {
      return res.status(404).json({ message: 'User not found' });
    }

    // Validate and format skills
    const formattedSkills = Array.isArray(req.body.skills) 
      ? req.body.skills.map((skill: any) => {
          if (typeof skill === 'string') {
            return {
              name: skill,
              proficiency: 1,
              endorsements: []
            };
          }
          return skill;
        })
      : [];

    // Update user model fields
    const userUpdateData = {
      name: req.body.name,
      bio: req.body.bio,
      skills: formattedSkills,
      linkedin: req.body.linkedin,
      github: req.body.github
    };

    // Update user document
    await User.findByIdAndUpdate(req.user._id, userUpdateData, { new: true });

    // Update profile document
    const profileData = {
      department: req.body.department,
      yearOfGraduation: req.body.yearOfGraduation,
      experiences: Array.isArray(req.body.experiences) ? req.body.experiences : []
    };

    if (!profile) {
      profile = new UserProfile({
        user: req.user._id,
        ...profileData
      });
    } else {
      Object.assign(profile, profileData);
    }

    await profile.save();
    
    // Fetch updated profile with populated user data
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
