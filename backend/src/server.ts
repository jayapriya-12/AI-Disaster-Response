import express, { Request, Response } from 'express';
import cors from 'cors';
import dotenv from 'dotenv';
import authRoutes from './routes/authRoutes';
import userRoutes from './routes/userRoutes';
import disasterRoutes from './routes/disasterRoutes';
import reportRoutes from './routes/reportRoutes';
import shelterRoutes from './routes/shelterRoutes';
import resourceRoutes from './routes/resourceRoutes';
import assignmentRoutes from './routes/assignmentRoutes';
import aiRoutes from './routes/aiRoutes';
import { errorHandler } from './middleware/errorHandler';

dotenv.config();

const app = express();
const PORT = process.env.PORT || 5000;
const FRONTEND_URL = process.env.FRONTEND_URL || 'http://localhost:5173';

// CORS Middleware Configuration
app.use(
  cors({
    origin: (origin, callback) => {
      // Allow requests with no origin (mobile apps, curl, postman) or matching frontend URL
      if (!origin || origin === FRONTEND_URL || origin.includes('localhost') || origin.includes('vercel.app')) {
        callback(null, true);
      } else {
        callback(null, true); // Permissive for production deployment flexibility
      }
    },
    credentials: true,
  })
);

app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// Health Check Endpoint (Public, no auth required)
app.get('/api/health', (req: Request, res: Response) => {
  return res.status(200).json({
    status: 'OK',
    message: 'AI Disaster Response Backend is running',
    timestamp: new Date().toISOString(),
  });
});

// API Routes
app.use('/api/auth', authRoutes);
app.use('/api/users', userRoutes);
app.use('/api/disasters', disasterRoutes);
app.use('/api/reports', reportRoutes);
app.use('/api/shelters', shelterRoutes);
app.use('/api/resources', resourceRoutes);
app.use('/api/assignments', assignmentRoutes);
app.use('/api/ai', aiRoutes);

// Global Error Handler
app.use(errorHandler);

// Listen on 0.0.0.0 for cloud deployment readiness
app.listen(Number(PORT), '0.0.0.0', () => {
  console.log(`🚀 AI Disaster Response Backend listening on http://0.0.0.0:${PORT}`);
  console.log(`🏥 Health check available at http://localhost:${PORT}/api/health`);
});
