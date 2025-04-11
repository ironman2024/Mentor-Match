import express from 'express';
import auth from '../middleware/auth';
import User from '../models/User';

const router = express.Router();

router.get('/mentors', auth, async (req, res) => {
  try {
    const mentors = await User.find({
      role: { $in: ['faculty', 'alumni'] },
      mentorshipAvailability: true
    }).select('name role expertise rating menteeCount reputation avatar');
    res.json(mentors);
  } catch (error: any) {
    res.status(500).json({ message: error.message });
  }
});

export default router;
