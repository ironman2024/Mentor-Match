import express from 'express';
import auth from '../middleware/auth';
import MentorshipSession from '../models/MentorshipSession';
import Certificate from '../models/Certificate';
import Chat from '../models/Chat';

const router = express.Router();

// Get mentor dashboard stats
router.get('/stats', auth, async (req: any, res) => {
  try {
    const stats = await MentorshipSession.aggregate([
      { $match: { mentor: req.user._id } },
      {
        $group: {
          _id: null,
          totalSessions: { $sum: 1 },
          completedSessions: {
            $sum: { $cond: [{ $eq: ['$status', 'completed'] }, 1, 0] }
          },
          activeStudents: { $addToSet: '$mentee' }
        }
      }
    ]);
    res.json(stats[0] || { totalSessions: 0, completedSessions: 0, activeStudents: [] });
  } catch (error: any) {
    res.status(500).json({ message: error.message });
  }
});

// Get pending mentorship requests
router.get('/requests', auth, async (req: any, res) => {
  try {
    const requests = await MentorshipSession.find({
      mentor: req.user._id,
      status: 'pending'
    }).populate('mentee', 'name avatar role');
    res.json(requests);
  } catch (error: any) {
    res.status(500).json({ message: error.message });
  }
});

// Update mentorship request status
router.patch('/requests/:id', auth, async (req: any, res) => {
  try {
    const { status } = req.body;
    const session = await MentorshipSession.findByIdAndUpdate(
      req.params.id,
      { status },
      { new: true }
    );
    res.json(session);
  } catch (error: any) {
    res.status(500).json({ message: error.message });
  }
});

export default router;
