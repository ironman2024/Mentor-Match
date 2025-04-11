import express from 'express';
import auth from '../middleware/auth';
import Project from '../models/Project';
import { io } from '../index';

const router = express.Router();

router.post('/', auth, async (req: any, res) => {
  try {
    const project = new Project({
      ...req.body,
      creator: req.user._id
    });

    await project.save();
    
    // Populate creator details before broadcasting
    const populatedProject = await project.populate('creator', 'name avatar role');
    
    // Emit new project to all connected clients
    io.emit('new_project', populatedProject);

    res.status(201).json(populatedProject);
  } catch (error: any) {
    res.status(500).json({
      message: 'Error creating project',
      error: error.message
    });
  }
});

router.get('/', auth, async (req: any, res) => {
  try {
    const filters: any = {};
    
    // Apply filters if provided
    if (req.query.complexity) {
      filters['technicalDetails.complexity'] = req.query.complexity;
    }
    if (req.query.projectType) {
      filters.projectType = req.query.projectType;
    }
    if (req.query.domain) {
      filters['technicalDetails.domain'] = req.query.domain;
    }

    const projects = await Project.find(filters)
      .populate('creator', 'name avatar role')
      .populate('team', 'name avatar')
      .sort({ createdAt: -1 });

    res.json(projects);
  } catch (error: any) {
    res.status(500).json({
      message: 'Error fetching projects',
      error: error.message
    });
  }
});

export default router;
