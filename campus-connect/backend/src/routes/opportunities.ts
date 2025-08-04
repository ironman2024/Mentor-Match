import express from 'express';
import auth from '../middleware/auth';
import User from '../models/User';
import Opportunity from '../models/Opportunity';
import { AuthRequest } from '../types/auth';

const router = express.Router();

// Middleware to check if user is faculty or alumni
const checkRole = (req: AuthRequest, res: express.Response, next: express.NextFunction) => {
  if (!req.user) {
    return res.status(401).json({ message: 'User not authenticated' });
  }
  if (req.user.role !== 'faculty' && req.user.role !== 'alumni') {
    return res.status(403).json({ message: 'Not authorized to post opportunities' });
  }
  next();
};

router.post('/', auth, checkRole, async (req: AuthRequest, res) => {
  try {
    if (!req.user) {
      return res.status(401).json({ message: 'User not authenticated' });
    }
    const opportunity = new Opportunity({
      ...req.body,
      author: req.user._id
    });
    await opportunity.save();
    res.status(201).json(opportunity);
  } catch (error: any) {
    res.status(500).json({ message: error.message });
  }
});

router.get('/', auth, async (req: AuthRequest, res) => {
  try {
    const opportunities = await Opportunity.find()
      .sort({ createdAt: -1 })
      .populate('author', 'name role');
    res.json(opportunities);
  } catch (error: any) {
    res.status(500).json({ message: error.message });
  }
});

export default router;
