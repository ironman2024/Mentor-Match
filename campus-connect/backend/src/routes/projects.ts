import express from 'express';
import auth from '../middleware/auth';
import Project from '../models/Project';

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
