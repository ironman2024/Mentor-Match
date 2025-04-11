import express, { Request, Response } from 'express';
import cors from 'cors';
import dotenv from 'dotenv';
import mongoose from 'mongoose';
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
import { Server } from 'socket.io';
import http from 'http';
import projectRoutes from './routes/projects';

dotenv.config();

const app = express();
const PORT = Number(process.env.PORT || 5002); // Default to 5002 if PORT is not defined

// Updated CORS configuration
app.use(cors({
  origin: ['http://localhost:3000', 'http://localhost:3001'],
  methods: ['GET', 'POST', 'PUT', 'DELETE', 'PATCH'],
  allowedHeaders: ['Content-Type', 'Authorization'],
  credentials: true
}));

// Enable JSON parsing with larger size limit
app.use(express.json({ limit: '50mb' }));
app.use(express.urlencoded({ limit: '50mb', extended: true }));

// Add request logging middleware
app.use((req, res, next) => {
  console.log(`${new Date().toISOString()} - ${req.method} ${req.url}`);
  next();
});

// Create uploads directory if it doesn't exist
const uploadsDir = path.join(__dirname, '../uploads/images');
if (!fs.existsSync(uploadsDir)) {
  fs.mkdirSync(uploadsDir, { recursive: true });
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
app.use('/api/projects', projectRoutes); // Add this line

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

const findAvailablePort = async (startPort: number): Promise<number> => {
  let port = startPort;
  const server = require('net').createServer();

  const isPortAvailable = (port: number) =>
    new Promise((resolve) => {
      server.once('error', () => {
        server.removeAllListeners('listening');
        resolve(false);
      });
      
      server.once('listening', () => {
        server.close();
        resolve(true);
      });
      
      server.listen(port, '0.0.0.0');
    });

  while (!(await isPortAvailable(port))) {
    port++;
    if (port - startPort > 10) {
      throw new Error('No available ports found');
    }
  }

  return port;
};

export let io: Server; // Export io instance

const initSocketIO = (server: http.Server) => {
  io = new Server(server, {
    cors: {
      origin: ['http://localhost:3000', 'http://localhost:3001'],
      methods: ['GET', 'POST'],
      credentials: true
    }
  });

  io.on('connection', socket => {
    console.log('Client connected:', socket.id);
    
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
    // Connect to MongoDB first
    await connectDB();

    // Find available port
    const desiredPort = Number(process.env.PORT || 5002);
    const port = await findAvailablePort(desiredPort);
    
    if (port !== desiredPort) {
      console.log(`Port ${desiredPort} is in use, using port ${port}`);
      process.env.PORT = port.toString();
    }

    // Create HTTP server
    const server = http.createServer(app);
    io = initSocketIO(server); // Initialize Socket.IO

    // Start server
    server.listen(port, '0.0.0.0', () => {
      console.log(`Server running at http://localhost:${port}`);
    });

  } catch (error) {
    console.error('Failed to start server:', error);
    process.exit(1);
  }
};

startServer();
