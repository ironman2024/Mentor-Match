import express from 'express';
import auth from '../middleware/auth';
import User from '../models/User';
import Project from '../models/Project';

const router = express.Router();

// Find team members based on project requirements
router.post('/match', auth, async (req: any, res) => {
  try {
    const { requiredSkills, projectType, teamSize } = req.body;
    
    // Find users with matching skills
    const matchedUsers = await User.aggregate([
      {
        $match: {
          'skills.name': { $in: requiredSkills },
          _id: { $ne: req.user._id }
        }
      },
      {
        $addFields: {
          matchedSkillsCount: {
            $size: {
              $setIntersection: [
                '$skills.name',
                requiredSkills
              ]
            }
          },
          averageSkillLevel: {
            $avg: '$skills.proficiency'
          }
        }
      },
      {
        $sort: {
          matchedSkillsCount: -1,
          averageSkillLevel: -1,
          'mentorshipStats.successfulMentorships': -1
        }
      },
      {
        $limit: teamSize
      }
    ]);

    res.json(matchedUsers);
  } catch (error: any) {
    res.status(500).json({ message: error.message });
  }
});

// Suggest mentors based on project requirements
router.get('/suggest-mentors', auth, async (req: any, res) => {
  try {
    const { skills, projectType } = req.query;
    
    const mentors = await User.find({
      role: { $in: ['faculty', 'alumni'] },
      'skills.name': { $in: skills.split(',') },
      mentorshipAvailability: true
    })
    .sort({ 
      mentorRating: -1, 
      'mentorshipStats.successfulMentorships': -1 
    })
    .limit(5);

    res.json(mentors);
  } catch (error: any) {
    res.status(500).json({ message: error.message });
  }
});

export default router;
