/// <reference path="./types/socket.d.ts" />
import express, { Request, Response } from 'express';
import cors from 'cors';
import dotenv from 'dotenv';
import mongoose from 'mongoose';
import { validateEnvironmentVariables } from './utils/validateEnv';
import authRoutes from './routes/auth';
import connectDB from './config/db';
import postRoutes from './routes/posts'; // Import the posts route
import path from 'path';
import fs from 'fs';
import eventRoutes from './routes/events';
import userRoutes from './routes/users';
import notificationRoutes from './routes/notifications';
import imageRoutes from './routes/images';
import profileRoutes from './routes/profile'; // Import the profile route
import messageRoutes from './routes/messages';
import mentorshipRoutes from './routes/mentorship';
import mentorAvailabilityRoutes from './routes/mentorAvailability';
import mentorReviewsRoutes from './routes/mentorReviews';
import sessionSchedulingRoutes from './routes/sessionScheduling';
import mentorshipEnhancedRoutes from './routes/mentorshipEnhanced';
import teamRoutes from './routes/teams';
import skillRoutes from './routes/skills';
import leaderboardRoutes from './routes/leaderboard';
import assessmentRoutes from './routes/assessment';
import opportunityRoutes from './routes/opportunities';
import opportunityApplicationRoutes from './routes/opportunityApplications';
import systemRoutes from './routes/system';
const socketIo = require('socket.io');
const { Server } = socketIo;
import http from 'http';
import projectRoutes from './routes/projects';
import badgeRoutes from './routes/badges';
import SchedulerService from './services/SchedulerService';
import jwt from 'jsonwebtoken';
import User from './models/User';

dotenv.config();

// Validate environment variables after loading .env
validateEnvironmentVariables();

const app = express();
const PORT = parseInt(process.env.PORT || '5002', 10);

// Updated CORS configuration
app.use(cors({
  origin: [
    'http://localhost:3000', 
    'http://localhost:3001',
    'https://your-frontend-app.onrender.com' // Replace with your actual Render frontend URL
  ],
  methods: ['GET', 'POST', 'PUT', 'DELETE', 'PATCH'],
  allowedHeaders: ['Content-Type', 'Authorization'],
  credentials: true,
  exposedHeaders: ['Authorization']
}));

// Enable JSON parsing with larger size limit
app.use(express.json({ limit: '50mb' }));
app.use(express.urlencoded({ limit: '50mb', extended: true }));

// Add better request logging middleware
app.use((req, res, next) => {
  console.log(`${new Date().toISOString()} - ${req.method} ${req.url}`);
  console.log('Request Headers:', req.headers);
  console.log('Request Body:', req.body);
  
  // Add response logging with proper typing
  const oldSend = res.send;
  res.send = function(...args) {
    console.log('Response:', args[0]);
    return oldSend.apply(res, args);
  };
  
  next();
});

// Ensure JWT_SECRET is set
if (!process.env.JWT_SECRET) {
  console.warn('WARNING: JWT_SECRET is not set. Using default secret. This is not secure for production!');
  process.env.JWT_SECRET = 'default_jwt_secret_for_development';
}

// Create uploads directories if they don't exist
const uploadsDir = path.join(__dirname, '../uploads/images');
const resumesDir = path.join(__dirname, '../uploads/resumes');
const avatarsDir = path.join(__dirname, '../uploads/avatars');
if (!fs.existsSync(uploadsDir)) {
  fs.mkdirSync(uploadsDir, { recursive: true });
}
if (!fs.existsSync(resumesDir)) {
  fs.mkdirSync(resumesDir, { recursive: true });
}
if (!fs.existsSync(avatarsDir)) {
  fs.mkdirSync(avatarsDir, { recursive: true });
}

// Serve static files from uploads directory
app.use('/uploads', express.static(path.join(__dirname, '../uploads')));

// Mount routes with /api prefix
app.use('/api/auth', authRoutes);
app.use('/api/posts', postRoutes); // Mount the posts route
app.use('/api/events', eventRoutes);
app.use('/api/users', userRoutes);
app.use('/api/notifications', notificationRoutes);
app.use('/api/images', imageRoutes);
app.use('/api/profile', profileRoutes); // Mount the profile route
app.use('/api/messages', messageRoutes); // Add messages route
app.use('/api/mentorship', mentorshipRoutes);
app.use('/api/mentor-availability', mentorAvailabilityRoutes);
app.use('/api/mentor-reviews', mentorReviewsRoutes);
app.use('/api/session-scheduling', sessionSchedulingRoutes);
app.use('/api/mentorship-enhanced', mentorshipEnhancedRoutes);
app.use('/api/projects', projectRoutes);
app.use('/api/badges', badgeRoutes);
app.use('/api/teams', teamRoutes);
app.use('/api/skills', skillRoutes);
app.use('/api/leaderboard', leaderboardRoutes);
app.use('/api/assessment', assessmentRoutes);
app.use('/api/opportunities', opportunityRoutes);
app.use('/api/opportunity-applications', opportunityApplicationRoutes);
app.use('/api/system', systemRoutes);

app.get('/', (req: Request, res: Response) => {
  res.json({ message: 'Welcome to Campus Connect API' });
});

// Test route to verify API is working
app.get('/api/health', (req, res) => {
  res.json({ status: 'ok' });
});

// Health check endpoint
app.get('/api/health', (req, res) => {
  res.json({
    status: 'ok',
    mongo: mongoose.connection.readyState === 1 ? 'connected' : 'disconnected'
  });
});

// Add better error logging
app.use((err: any, req: express.Request, res: express.Response, next: express.NextFunction) => {
  console.error('Error details:', {
    message: err.message,
    stack: err.stack,
    path: req.path,
    method: req.method
  });
  
  if (!res.headersSent) {
    res.status(err.status || 500).json({ 
      message: err.message || 'Internal server error',
      error: process.env.NODE_ENV === 'development' ? err : undefined
    });
  }
});

export let io: any; // Export io instance

const initSocketIO = (server: http.Server) => {
  io = new Server(server, {
    cors: {
      origin: ['http://localhost:3000', 'http://localhost:3001'],
      methods: ['GET', 'POST'],
      credentials: true
    }
  });

  // Socket authentication middleware
  io.use(async (socket: any, next: (err?: Error) => void) => {
    try {
      const token = socket.handshake.auth.token;
      if (!token) {
        return next(new Error('Authentication error'));
      }

      const decoded = jwt.verify(token, process.env.JWT_SECRET!) as any;
      const user = await User.findById(decoded.userId);
      if (!user) {
        return next(new Error('User not found'));
      }

      socket.userId = user._id.toString();
      socket.user = user;
      next();
    } catch (error) {
      next(new Error('Authentication error'));
    }
  });

  io.on('connection', (socket: any) => {
    console.log('Client connected:', socket.id, 'User:', socket.userId);
    
    // Join user to their own room for private messaging
    if (socket.userId) {
      socket.join(socket.userId);
    }
    
    socket.on('join', (data: { userId: string }) => {
      socket.join(data.userId);
      console.log(`User ${data.userId} joined room`);
    });

    // Handle sending messages
    socket.on('send_message', (data: { recipientId: string; message: any }) => {
      console.log('Message sent:', data);
      // Send to recipient
      socket.to(data.recipientId).emit('new_message', data.message);
      // Also send to sender for confirmation
      socket.emit('message_sent', data.message);
    });

    // Handle typing indicators
    socket.on('typing', (data: { recipientId: string; isTyping: boolean }) => {
      if (socket.userId) {
        socket.to(data.recipientId).emit('user_typing', {
          userId: socket.userId,
          isTyping: data.isTyping
        });
      }
    });

    // Handle message deletion
    socket.on('message_deleted', (data: { messageId: string; recipientId: string }) => {
      socket.to(data.recipientId).emit('message_deleted', {
        messageId: data.messageId
      });
    });
    
    socket.on('new_project', (project: any) => {
      io.emit('project_update', project);
    });

    socket.on('disconnect', () => {
      console.log('Client disconnected:', socket.id);
    });
  });

  return io;
};

const startServer = async () => {
  try {
    await connectDB();
    
    // Initialize scheduler for badges and leaderboards
    SchedulerService.init();
    
    // Remove the findAvailablePort call and use PORT directly
    const server = app.listen(PORT, '0.0.0.0', () => {
      console.log(`Server running on port ${PORT}`);
    });

    // Initialize socket.io after server is started
    initSocketIO(server);

    // Graceful shutdown handler
    const shutdown = () => {
      console.log('Shutting down gracefully...');
      server.close(() => {
        mongoose.connection.close().then(() => {
          console.log('MongoDB connection closed');
          process.exit(0);
        }).catch(err => {
          console.error('Error closing MongoDB connection:', err);
          process.exit(1);
        });
      });
    };

    process.on('SIGTERM', shutdown);
    process.on('SIGINT', shutdown);

  } catch (error) {
    console.error('Failed to start server:', error);
    process.exit(1);
  }
};

startServer();
