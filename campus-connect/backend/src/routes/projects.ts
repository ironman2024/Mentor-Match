import express from 'express';
import auth from '../middleware/auth';
import Project from '../models/Project';
import User from '../models/User';

const router = express.Router();

// Create new project
router.post('/', auth, async (req: any, res) => {
  try {
    const project = new Project({
      ...req.body,
      creator: req.user._id,
      team: [req.user._id] // Add creator to team
    });

    await project.save();
    const populatedProject = await project.populate('creator', 'name avatar role');

    res.status(201).json(populatedProject);
  } catch (error: any) {
    console.error('Project creation error:', error);
    res.status(500).json({ message: error.message });
  }
});

// Get all projects with filters
router.get('/', auth, async (req: any, res) => {
  try {
    const { type, complexity, status, search } = req.query;
    const query: any = {};

    if (type) query['projectType'] = type;
    if (complexity) query['technicalDetails.complexity'] = complexity;
    if (status) query.status = status;
    if (search) {
      query.$or = [
        { title: { $regex: search, $options: 'i' } },
        { description: { $regex: search, $options: 'i' } },
        { 'technicalDetails.techStack': { $regex: search, $options: 'i' } }
      ];
    }

    const projects = await Project.find(query)
      .populate('creator', 'name avatar role')
      .populate('team', 'name avatar')
      .sort({ createdAt: -1 });

    res.json(projects);
  } catch (error: any) {
    console.error('Error fetching projects:', error);
    res.status(500).json({ message: error.message });
  }
});

// Get project recommendations
router.get('/recommendations', auth, async (req: any, res) => {
  try {
    const user = req.user;
    const userSkills = user.skills?.map((skill: any) => skill.name.toLowerCase()) || [];
    const userInterests = user.teamPreferences?.projectInterests?.map((interest: string) => interest.toLowerCase()) || [];
    const userComplexityLevel = getUserComplexityLevel(user);

    // Find projects that match user's skills and interests
    const allProjects = await Project.find({ 
      creator: { $ne: user._id },
      status: 'open'
    })
    .populate('creator', 'name avatar role')
    .populate('team', 'name avatar');

    // Score projects based on skill match, complexity, and interests
    const scoredProjects = allProjects.map(project => {
      let score = 0;
      const projectSkills = project.technicalDetails?.requiredSkills?.map((skill: string) => skill.toLowerCase()) || [];
      const projectTechStack = project.technicalDetails?.techStack?.map((tech: string) => tech.toLowerCase()) || [];
      const projectDomains = project.technicalDetails?.domain?.map((domain: string) => domain.toLowerCase()) || [];

      // Skill matching (40% weight)
      const skillMatches = projectSkills.filter(skill => 
        userSkills.some((userSkill: string) => userSkill.includes(skill) || skill.includes(userSkill))
      ).length;
      const techMatches = projectTechStack.filter(tech => 
        userSkills.some((userSkill: string) => userSkill.includes(tech) || tech.includes(userSkill))
      ).length;
      score += (skillMatches + techMatches) * 0.4;

      // Interest matching (30% weight)
      const interestMatches = projectDomains.filter(domain => 
        userInterests.some((interest: string) => interest.includes(domain) || domain.includes(interest))
      ).length;
      score += interestMatches * 0.3;

      // Complexity matching (20% weight)
      const complexityMatch = getComplexityScore(project.technicalDetails?.complexity, userComplexityLevel);
      score += complexityMatch * 0.2;

      // Project type preference (10% weight)
      if (user.teamPreferences?.projectInterests?.includes(project.projectType)) {
        score += 0.1;
      }

      return { project, score };
    });

    // Sort by score and return top recommendations
    const recommendations = scoredProjects
      .filter(item => item.score > 0)
      .sort((a, b) => b.score - a.score)
      .slice(0, 12)
      .map(item => item.project);

    res.json(recommendations);
  } catch (error: any) {
    console.error('Error fetching recommendations:', error);
    res.status(500).json({ message: error.message });
  }
});

// Helper functions
function getUserComplexityLevel(user: any): string {
  const avgSkillLevel = user.skills?.reduce((sum: number, skill: any) => sum + skill.proficiency, 0) / (user.skills?.length || 1);
  const experienceYears = user.areasOfExpertise?.reduce((sum: number, area: any) => sum + area.yearsOfExperience, 0) / (user.areasOfExpertise?.length || 1);
  
  if (avgSkillLevel >= 4 || experienceYears >= 3) return 'advanced';
  if (avgSkillLevel >= 3 || experienceYears >= 1) return 'intermediate';
  return 'beginner';
}

function getComplexityScore(projectComplexity: string, userLevel: string): number {
  const levels = { beginner: 1, intermediate: 2, advanced: 3 };
  const projectLevel = levels[projectComplexity as keyof typeof levels] || 1;
  const userLevelNum = levels[userLevel as keyof typeof levels] || 1;
  
  // Perfect match gets full score, adjacent levels get partial score
  if (projectLevel === userLevelNum) return 1;
  if (Math.abs(projectLevel - userLevelNum) === 1) return 0.5;
  return 0;
}

// Update project
router.patch('/:id', auth, async (req: any, res) => {
  try {
    const project = await Project.findById(req.params.id);
    if (!project) return res.status(404).json({ message: 'Project not found' });
    
    if (project.creator.toString() !== req.user._id.toString()) {
      return res.status(403).json({ message: 'Not authorized' });
    }

    Object.assign(project, req.body);
    await project.save();
    
    res.json(project);
  } catch (error: any) {
    res.status(500).json({ message: error.message });
  }
});

export default router;
