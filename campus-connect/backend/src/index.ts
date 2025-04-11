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
import { Server } from 'socket.io';
import http from 'http';

dotenv.config();

const app = express();
const PORT = Number(process.env.PORT || 5002); // Default to 5002 if PORT is not defined

// Updated CORS configuration
app.use(cors({
  origin: 'http://localhost:3000',
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

// Update error handling
app.use((err: any, req: express.Request, res: express.Response, next: express.NextFunction) => {
  console.error('Global error:', err);
  res.status(500).json({ 
    message: 'Internal server error',
    error: process.env.NODE_ENV === 'development' ? err.message : undefined
  });
});

const findAvailablePort = async (startPort: number): Promise<number> => {
  return new Promise((resolve, reject) => {
    const server = require('net').createServer();
    server.unref();
    server.on('error', (err: any) => {
      if (err.code === 'EADDRINUSE') {
        resolve(findAvailablePort(startPort + 1));
      } else {
        reject(err);
      }
    });
    server.listen(startPort, () => {
      server.close(() => {
        resolve(startPort);
      });
    });
  });
};

const server = http.createServer(app);
const io = new Server(server, {
  cors: {
    origin: "http://localhost:3000",
    methods: ["GET", "POST"],
    credentials: true
  }
});

// Socket.IO connection handler
io.on('connection', (socket) => {
  console.log('User connected:', socket.id);

  socket.on('join', (userId) => {
    socket.join(userId);
    console.log('User joined room:', userId);
  });

  socket.on('send_message', async (data) => {
    try {
      const { recipientId, message } = data;
      io.to(recipientId).emit('receive_message', message);
    } catch (error) {
      console.error('Socket message error:', error);
    }
  });

  socket.on('disconnect', () => {
    console.log('User disconnected:', socket.id);
  });
});

// Update server start
const startServer = async () => {
  try {
    await connectDB();
    const port = await findAvailablePort(5002);
    server.listen(port, () => {
      console.log(`Server running on http://localhost:${port}`);
    });
  } catch (error) {
    console.error('Failed to start server:', error);
    process.exit(1);
  }
};

startServer();
