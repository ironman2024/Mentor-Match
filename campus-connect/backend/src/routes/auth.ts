import express, { Request, Response } from 'express';
import jwt from 'jsonwebtoken';
import User from '../models/User';
import auth from '../middleware/auth';

interface AuthRequest extends Request {
  user?: {
    _id: string;
  };
}

const router = express.Router();

router.post('/login', async (req: Request, res: Response) => {
  try {
    const { email, password } = req.body;

    // Input validation
    if (!email || !password) {
      return res.status(400).json({ 
        message: 'Email and password are required',
        details: { email: !email, password: !password }
      });
    }

    // Find user with detailed logging
    console.log('Attempting to find user with email:', email);
    const user = await User.findOne({ email });
    
    if (!user) {
      console.log('User not found with email:', email);
      return res.status(401).json({ message: 'Invalid credentials' });
    }

    // Check password with detailed logging
    console.log('Checking password for user:', email);
    const isValidPassword = await user.comparePassword(password);
    
    if (!isValidPassword) {
      console.log('Invalid password for user:', email);
      return res.status(401).json({ message: 'Invalid credentials' });
    }

    // Generate token with proper secret
    const jwtSecret = process.env.JWT_SECRET || 'default_jwt_secret_for_development';
    console.log('Generating JWT token with secret:', jwtSecret.substring(0, 3) + '...');
    
    const token = jwt.sign(
      { userId: user._id },
      jwtSecret,
      { expiresIn: '24h' }
    );

    console.log('Login successful for user:', email);
    
    // Check if mentor profile setup is needed
    const needsMentorSetup = (user.role === 'alumni' || user.role === 'faculty') && 
                            (!user.mentorshipAvailability || 
                             !user.areasOfExpertise || 
                             user.areasOfExpertise.length === 0);
    
    res.json({
      token,
      user: {
        _id: user._id,
        email: user.email,
        name: user.name,
        role: user.role,
        avatar: user.avatar,
        skills: user.skills || [],
        reputation: user.reputation || 0,
        badges: user.badges || [],
        needsMentorSetup
      }
    });

  } catch (error: any) {
    console.error('Login error:', error);
    res.status(500).json({ 
      message: 'Login failed',
      error: process.env.NODE_ENV === 'development' ? error.message : undefined
    });
  }
});

router.post('/register', async (req: Request, res: Response) => {
  try {
    console.log('Registration request received:', {
      ...req.body,
      password: '[HIDDEN]'
    });
    
    const { email, password, name, role } = req.body;

    // Input validation
    if (!email || !password || !name || !role) {
      return res.status(400).json({ 
        message: 'All fields are required',
        details: {
          email: !email,
          password: !password,
          name: !name,
          role: !role
        }
      });
    }

    // Check for existing user
    const existingUser = await User.findOne({ email });
    if (existingUser) {
      console.log('Registration failed: User already exists:', email);
      return res.status(400).json({ message: 'User already exists' });
    }

    // Create new user
    const user = new User({
      email,
      password,
      name,
      role,
      skills: [],
      reputation: 0,
      badges: []
    });

    await user.save();
    console.log('New user created successfully:', email);

    const jwtSecret = process.env.JWT_SECRET || 'default_jwt_secret_for_development';
    const token = jwt.sign(
      { userId: user._id },
      jwtSecret,
      { expiresIn: '24h' }
    );

    res.status(201).json({
      message: 'User registered successfully',
      token,
      user: {
        _id: user._id,
        email: user.email,
        name: user.name,
        role: user.role
      }
    });

  } catch (error: any) {
    console.error('Registration error:', error);
    res.status(500).json({ 
      message: 'Registration failed',
      error: process.env.NODE_ENV === 'development' ? error.message : undefined
    });
  }
});

router.get('/me', auth, async (req: AuthRequest, res: Response) => {
  try {
    if (!req.user?._id) {
      return res.status(401).json({ message: 'Authentication required' });
    }

    const user = await User.findById(req.user._id).select('-password');
    if (!user) {
      return res.status(404).json({ message: 'User not found' });
    }
    res.json(user);
  } catch (error) {
    res.status(500).json({ message: 'Server error' });
  }
});

export default router;
