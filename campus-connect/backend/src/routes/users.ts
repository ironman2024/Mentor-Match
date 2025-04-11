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

// Get recommended users
router.get('/recommendations', auth, async (req: any, res) => {
  try {
    // First get faculty and alumni
    const mentors = await User.find({
      role: { $in: ['faculty', 'alumni'] },
    })
    .select('name role avatar department')
    .limit(5);

    // Get some active students
    const students = await User.find({
      role: 'student',
      _id: { $ne: req.user._id }
    })
    .select('name role avatar department')
    .limit(5);

    // Get clubs
    const clubs = await User.find({
      role: 'club'
    })
    .select('name role avatar')
    .limit(3);

    res.json({
      mentors,
      students,
      clubs
    });
  } catch (error: any) {
    res.status(500).json({ message: error.message });
  }
});

// Search users
router.get('/search', auth, async (req: any, res) => {
  try {
    const searchTerm = req.query.q;
    const users = await User.find({
      $and: [
        { _id: { $ne: req.user._id } },
        {
          $or: [
            { name: { $regex: searchTerm, $options: 'i' } },
            { department: { $regex: searchTerm, $options: 'i' } }
          ]
        }
      ]
    })
    .select('name role avatar department')
    .limit(10);

    res.json(users);
  } catch (error: any) {
    res.status(500).json({ message: error.message });
  }
});

// Get mentor leaderboard
router.get('/mentors/leaderboard', auth, async (req, res) => {
  try {
    const mentors = await User.find({
      role: { $in: ['faculty', 'alumni'] }
    })
    .select('name role avatar department mentorRating totalRatings messageCount')
    .sort({ mentorRating: -1, messageCount: -1 })
    .limit(10);

    res.json(mentors);
  } catch (error: any) {
    res.status(500).json({ message: error.message });
  }
});

// Rate a mentor
router.post('/mentors/:id/rate', auth, async (req: any, res) => {
  try {
    const { rating } = req.body;
    const mentor = await User.findById(req.params.id);

    if (!mentor) {
      return res.status(404).json({ message: 'Mentor not found' });
    }

    const newRating = (mentor.mentorRating * mentor.totalRatings + rating) / (mentor.totalRatings + 1);
    
    mentor.mentorRating = Number(newRating.toFixed(1));
    mentor.totalRatings += 1;
    await mentor.save();

    res.json({ message: 'Rating submitted successfully' });
  } catch (error: any) {
    res.status(500).json({ message: error.message });
  }
});

export default router;
