import express from 'express';
import mongoose from 'mongoose';
import cors from 'cors';
import authRoutes from './routes/auth';
import mentorshipRoutes from './routes/mentorship';
import assessmentRoutes from './routes/assessment';
import eventRoutes from './routes/events';
import leaderboardRoutes from './routes/leaderboard';
import badgeRoutes from './routes/badges';
import recommendationRoutes from './routes/recommendations';
import path from 'path';

const app = express();

// Middleware
app.use(cors());
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// Serve static files from the React frontend app
app.use(express.static(path.join(__dirname, '../../frontend/build')));

// API Routes
app.use('/api/auth', authRoutes);
app.use('/api/mentorship', mentorshipRoutes);
app.use('/api/assessment', assessmentRoutes);
app.use('/api/events', eventRoutes);
app.use('/api/leaderboard', leaderboardRoutes);
app.use('/api/badges', badgeRoutes);
app.use('/api/recommendations', recommendationRoutes);

// Catch all route for React frontend
app.get('*', (req, res) => {
  res.sendFile(path.join(__dirname, '../../frontend/build', 'index.html'));
});

// Error handling middleware
app.use((err: any, req: express.Request, res: express.Response, next: express.NextFunction) => {
  console.error(err.stack);
  res.status(err.status || 500).json({ message: err.message || 'Internal server error' });
});

export default app;