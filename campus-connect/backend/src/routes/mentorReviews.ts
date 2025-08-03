import express from 'express';
import auth from '../middleware/auth';
import MentorReview from '../models/MentorReview';
import User from '../models/User';

const router = express.Router();

// Get reviews for a mentor
router.get('/mentor/:mentorId', auth, async (req, res) => {
  try {
    const { mentorId } = req.params;
    const { page = 1, limit = 10 } = req.query;
    
    const reviews = await MentorReview.find({ 
      mentor: mentorId, 
      status: 'active' 
    })
    .populate('mentee', 'name avatar')
    .populate('session', 'topic')
    .sort({ createdAt: -1 })
    .limit(Number(limit) * Number(page))
    .skip((Number(page) - 1) * Number(limit));

    const total = await MentorReview.countDocuments({ 
      mentor: mentorId, 
      status: 'active' 
    });

    // Calculate average ratings
    const avgRatings = await MentorReview.aggregate([
      { $match: { mentor: mentorId, status: 'active' } },
      {
        $group: {
          _id: null,
          avgRating: { $avg: '$rating' },
          avgCommunication: { $avg: '$categories.communication' },
          avgExpertise: { $avg: '$categories.expertise' },
          avgHelpfulness: { $avg: '$categories.helpfulness' },
          avgAvailability: { $avg: '$categories.availability' }
        }
      }
    ]);

    res.json({
      reviews,
      pagination: {
        page: Number(page),
        limit: Number(limit),
        total,
        pages: Math.ceil(total / Number(limit))
      },
      averages: avgRatings[0] || {
        avgRating: 0,
        avgCommunication: 0,
        avgExpertise: 0,
        avgHelpfulness: 0,
        avgAvailability: 0
      }
    });
  } catch (error: any) {
    res.status(500).json({ message: error.message });
  }
});

// Submit a review
router.post('/', auth, async (req: any, res) => {
  try {
    const {
      mentorId,
      sessionId,
      rating,
      review,
      categories,
      isAnonymous = false
    } = req.body;

    // Check if review already exists
    const existingReview = await MentorReview.findOne({
      mentor: mentorId,
      mentee: req.user._id,
      session: sessionId
    });

    if (existingReview) {
      return res.status(400).json({ message: 'Review already submitted for this session' });
    }

    const newReview = new MentorReview({
      mentor: mentorId,
      mentee: req.user._id,
      session: sessionId,
      rating,
      review,
      categories,
      isAnonymous
    });

    await newReview.save();

    // Update mentor's overall rating
    const mentor = await User.findById(mentorId);
    if (mentor) {
      const newRating = (mentor.mentorRating * mentor.totalRatings + rating) / (mentor.totalRatings + 1);
      mentor.mentorRating = Number(newRating.toFixed(1));
      mentor.totalRatings += 1;
      await mentor.save();
    }

    res.status(201).json({ message: 'Review submitted successfully', review: newReview });
  } catch (error: any) {
    res.status(500).json({ message: error.message });
  }
});

// Vote review as helpful
router.post('/:reviewId/helpful', auth, async (req, res) => {
  try {
    const review = await MentorReview.findByIdAndUpdate(
      req.params.reviewId,
      { $inc: { helpfulVotes: 1 } },
      { new: true }
    );

    if (!review) {
      return res.status(404).json({ message: 'Review not found' });
    }

    res.json({ message: 'Vote recorded', helpfulVotes: review.helpfulVotes });
  } catch (error: any) {
    res.status(500).json({ message: error.message });
  }
});

// Report a review
router.post('/:reviewId/report', auth, async (req, res) => {
  try {
    const review = await MentorReview.findByIdAndUpdate(
      req.params.reviewId,
      { 
        $inc: { reportCount: 1 },
        status: 'reported'
      },
      { new: true }
    );

    if (!review) {
      return res.status(404).json({ message: 'Review not found' });
    }

    res.json({ message: 'Review reported successfully' });
  } catch (error: any) {
    res.status(500).json({ message: error.message });
  }
});

export default router;