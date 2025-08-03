import express from 'express';
import { Skill, UserSkill } from '../models/Skill';
import SkillMatchingService from '../services/SkillMatchingService';
import { auth } from '../middleware/auth';

const router = express.Router();

// Get all skills
router.get('/', async (req, res) => {
  try {
    const { category, search } = req.query;
    const filter: any = {};
    
    if (category) filter.category = category;
    if (search) filter.$text = { $search: search as string };

    const skills = await Skill.find(filter)
      .sort({ popularity: -1, name: 1 })
      .limit(100);
    
    res.json(skills);
  } catch (error: any) {
    res.status(500).json({ message: error.message });
  }
});

// Add user skill
router.post('/user', auth, async (req, res) => {
  try {
    const { skillName, proficiencyLevel, yearsOfExperience } = req.body;
    
    let skill = await Skill.findOne({ name: skillName });
    if (!skill) {
      skill = new Skill({ name: skillName, category: 'technical' });
      await skill.save();
    }

    const userSkill = new UserSkill({
      user: req.user.id,
      skill: skill._id,
      proficiencyLevel,
      yearsOfExperience: yearsOfExperience || 0
    });

    await userSkill.save();
    await skill.updateOne({ $inc: { popularity: 1 } });
    
    res.status(201).json(await userSkill.populate('skill'));
  } catch (error: any) {
    res.status(400).json({ message: error.message });
  }
});

// Get user skills
router.get('/user/:userId?', auth, async (req, res) => {
  try {
    const userId = req.params.userId || req.user.id;
    const userSkills = await UserSkill.find({ user: userId })
      .populate('skill endorsements.endorser', 'name avatar')
      .sort({ 'endorsements.length': -1, proficiencyLevel: -1 });
    
    res.json(userSkills);
  } catch (error: any) {
    res.status(500).json({ message: error.message });
  }
});

// Endorse skill
router.post('/endorse', auth, async (req, res) => {
  try {
    const { userId, skillId, comment } = req.body;
    
    const success = await SkillMatchingService.endorseSkill(
      skillId, 
      userId, 
      req.user.id, 
      comment
    );
    
    if (!success) {
      return res.status(400).json({ message: 'Cannot endorse this skill' });
    }
    
    res.json({ message: 'Skill endorsed successfully' });
  } catch (error: any) {
    res.status(500).json({ message: error.message });
  }
});

// Get skill compatibility
router.get('/compatibility/:targetUserId', auth, async (req, res) => {
  try {
    const compatibility = await SkillMatchingService.calculateSkillCompatibility(
      req.user.id,
      req.params.targetUserId
    );
    
    res.json(compatibility);
  } catch (error: any) {
    res.status(500).json({ message: error.message });
  }
});

// Find mentors by skills
router.post('/find-mentors', auth, async (req, res) => {
  try {
    const { requiredSkills } = req.body;
    
    const mentors = await SkillMatchingService.findSkillBasedMentors(
      req.user.id,
      requiredSkills
    );
    
    res.json(mentors);
  } catch (error: any) {
    res.status(500).json({ message: error.message });
  }
});

// Get team recommendations
router.get('/team-recommendations', auth, async (req, res) => {
  try {
    const userSkills = await UserSkill.find({ user: req.user.id })
      .populate('skill');
    
    const skillNames = userSkills.map(us => (us.skill as any).name);
    
    const recommendations = await SkillMatchingService.recommendTeams(
      req.user.id,
      skillNames
    );
    
    res.json(recommendations);
  } catch (error: any) {
    res.status(500).json({ message: error.message });
  }
});

// Update user skill
router.put('/user/:skillId', auth, async (req, res) => {
  try {
    const { proficiencyLevel, yearsOfExperience } = req.body;
    
    const userSkill = await UserSkill.findOneAndUpdate(
      { user: req.user.id, skill: req.params.skillId },
      { proficiencyLevel, yearsOfExperience },
      { new: true }
    ).populate('skill');
    
    if (!userSkill) {
      return res.status(404).json({ message: 'Skill not found' });
    }
    
    res.json(userSkill);
  } catch (error: any) {
    res.status(500).json({ message: error.message });
  }
});

// Delete user skill
router.delete('/user/:skillId', auth, async (req, res) => {
  try {
    await UserSkill.findOneAndDelete({ 
      user: req.user.id, 
      skill: req.params.skillId 
    });
    
    res.json({ message: 'Skill removed successfully' });
  } catch (error: any) {
    res.status(500).json({ message: error.message });
  }
});

export default router;