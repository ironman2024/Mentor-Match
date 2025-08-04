import express from 'express';
import auth from '../middleware/auth';
import User from '../models/User';
import Project from '../models/Project';

interface AuthRequest extends express.Request {
  user?: {
    _id: string;
    id: string;
    role?: string;
  };
}

const router = express.Router();

// Get teammate recommendations for a project
router.get('/teammates/:projectId', auth, async (req: AuthRequest, res) => {
  try {
    const { projectId } = req.params;
    const project = await Project.findById(projectId);
    
    if (!project) {
      return res.status(404).json({ message: 'Project not found' });
    }

    const { requiredSkills, domain, complexity } = project.technicalDetails;
    
    // Find users with matching skills and interests
    const recommendations = await User.find({
      _id: { $nin: [...project.team, project.creator] },
      $or: [
        { 'skills.name': { $in: requiredSkills } },
        { 'teamPreferences.projectInterests': { $in: domain } },
        { 'areasOfExpertise.name': { $in: requiredSkills } }
      ]
    })
    .select('name avatar skills areasOfExpertise teamPreferences reputation')
    .limit(10);

    // Calculate match scores
    const scoredRecommendations = recommendations.map(user => {
      let score = 0;
      
      // Skill matching
      const userSkills = user.skills.map(s => s.name.toLowerCase());
      const matchingSkills = requiredSkills.filter(skill => 
        userSkills.includes(skill.toLowerCase())
      );
      score += matchingSkills.length * 3;
      
      // Domain interest matching
      const userInterests = user.teamPreferences?.projectInterests || [];
      const matchingInterests = domain.filter(d => 
        userInterests.some(interest => interest.toLowerCase().includes(d.toLowerCase()))
      );
      score += matchingInterests.length * 2;
      
      // Reputation bonus
      score += Math.min(user.reputation / 100, 2);
      
      return {
        user,
        score,
        matchingSkills,
        matchingInterests
      };
    });

    // Sort by score and return top matches
    const topRecommendations = scoredRecommendations
      .sort((a, b) => b.score - a.score)
      .slice(0, 5);

    res.json(topRecommendations);
  } catch (error: any) {
    res.status(500).json({ message: error.message });
  }
});

// Get mentor recommendations for a project
router.get('/mentors/:projectId', auth, async (req: AuthRequest, res) => {
  try {
    const { projectId } = req.params;
    const project = await Project.findById(projectId);
    
    if (!project) {
      return res.status(404).json({ message: 'Project not found' });
    }

    const { requiredSkills, domain, techStack } = project.technicalDetails;
    
    // Find mentors with relevant expertise
    const mentors = await User.find({
      role: { $in: ['faculty', 'alumni'] },
      mentorshipAvailability: true,
      $or: [
        { 'areasOfExpertise.name': { $in: [...requiredSkills, ...techStack] } },
        { 'skills.name': { $in: [...requiredSkills, ...techStack] } }
      ]
    })
    .select('name avatar areasOfExpertise mentorRating totalRatings mentorshipStats')
    .limit(10);

    // Calculate mentor match scores
    const scoredMentors = mentors.map(mentor => {
      let score = 0;
      
      // Expertise matching
      const mentorExpertise = mentor.areasOfExpertise.map(e => e.name.toLowerCase());
      const matchingExpertise = [...requiredSkills, ...techStack].filter(skill => 
        mentorExpertise.includes(skill.toLowerCase())
      );
      score += matchingExpertise.length * 4;
      
      // Rating bonus
      score += mentor.mentorRating * 2;
      
      // Experience bonus
      const avgExperience = mentor.areasOfExpertise.reduce((acc, exp) => 
        acc + exp.yearsOfExperience, 0) / mentor.areasOfExpertise.length;
      score += Math.min(avgExperience, 5);
      
      return {
        mentor,
        score,
        matchingExpertise
      };
    });

    const topMentors = scoredMentors
      .sort((a, b) => b.score - a.score)
      .slice(0, 3);

    res.json(topMentors);
  } catch (error: any) {
    res.status(500).json({ message: error.message });
  }
});

// Send recommendation notifications
router.post('/notify/:projectId', auth, async (req: AuthRequest, res) => {
  try {
    const { projectId } = req.params;
    const { userIds, type } = req.body; // type: 'teammate' | 'mentor'
    
    const project = await Project.findById(projectId).populate('creator', 'name');
    if (!project) {
      return res.status(404).json({ message: 'Project not found' });
    }

    // Here you would integrate with your notification system
    // For now, we'll just return success
    res.json({ 
      message: `${type} recommendations sent successfully`,
      notifiedUsers: userIds.length
    });
  } catch (error: any) {
    res.status(500).json({ message: error.message });
  }
});

export default router;