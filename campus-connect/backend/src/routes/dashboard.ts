import express from 'express';
import { getDashboard, getMentorshipStats, getMentorshipOverview } from '../controllers/dashboardController';
import { authenticateToken } from '../middleware/auth';

const router = express.Router();

router.get('/', authenticateToken, getDashboard);
router.get('/stats', authenticateToken, getMentorshipStats);
router.get('/mentorships', authenticateToken, getMentorshipOverview);

export default router;