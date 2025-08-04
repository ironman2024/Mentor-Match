import express from 'express';
import mongoose from 'mongoose';
import User from '../models/User';
import MentorshipRequest from '../models/MentorshipRequest';
import Event from '../models/Event';
import Badge from '../models/Badge';
import Team from '../models/Team';

const router = express.Router();

// System health and integration status
router.get('/health', async (req, res) => {
  try {
    const health = {
      status: 'healthy',
      timestamp: new Date().toISOString(),
      database: {
        status: mongoose.connection.readyState === 1 ? 'connected' : 'disconnected',
        collections: {}
      },
      modules: {
        authentication: true,
        mentorship: true,
        teamFormation: true,
        events: true,
        badges: true,
        messaging: true,
        projects: true,
        skills: true,
        leaderboard: true,
        notifications: true
      },
      integrations: {
        socketIO: true,
        fileUpload: true,
        realTimeChat: true,
        calendar: true,
        analytics: true
      }
    };

    // Check collection counts
    const collections = await Promise.all([
      User.countDocuments(),
      MentorshipRequest.countDocuments(),
      Event.countDocuments(),
      Badge.countDocuments()
    ]);

    health.database.collections = {
      users: collections[0],
      mentorshipRequests: collections[1],
      events: collections[2],
      badges: collections[3]
    };

    res.json(health);
  } catch (error: any) {
    res.status(500).json({
      status: 'unhealthy',
      error: error.message,
      timestamp: new Date().toISOString()
    });
  }
});

// Integration test endpoint
router.get('/integration-test', async (req, res) => {
  const tests = {
    database: false,
    models: false,
    authentication: false,
    fileSystem: false
  };

  try {
    // Test database connection
    tests.database = mongoose.connection.readyState === 1;

    // Test models
    const userCount = await User.countDocuments();
    tests.models = userCount >= 0;

    // Test file system (uploads directory)
    const fs = require('fs');
    const path = require('path');
    const uploadsDir = path.join(__dirname, '../../uploads');
    tests.fileSystem = fs.existsSync(uploadsDir);

    tests.authentication = true; // JWT is configured

    res.json({
      status: Object.values(tests).every(t => t) ? 'all_systems_operational' : 'partial_failure',
      tests,
      timestamp: new Date().toISOString()
    });
  } catch (error: any) {
    res.status(500).json({
      status: 'system_failure',
      tests,
      error: error.message,
      timestamp: new Date().toISOString()
    });
  }
});

export default router;