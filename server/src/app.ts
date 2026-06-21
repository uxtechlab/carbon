import express from 'express';
import cors from 'cors';
import dotenv from 'dotenv';
import { apiControllers } from './controllers/apiControllers';

// Load Environment Variables
dotenv.config();

const app = express();

// Middleware
app.use(cors({
  origin: '*', // allows any origin for development and easy hosting mapping
  methods: ['GET', 'POST', 'PUT', 'DELETE'],
  allowedHeaders: ['Content-Type', 'Authorization']
}));
app.use(express.json());

// Routes
// Carbon Footprints
app.post('/api/footprints', apiControllers.createFootprint);
app.get('/api/footprints', apiControllers.getFootprints);

// AI Carbon Coach
app.get('/api/coach/analyze', apiControllers.getCoachAnalysis);

// Goals
app.get('/api/goals', apiControllers.getGoals);
app.post('/api/goals', apiControllers.createGoal);
app.put('/api/goals/:id', apiControllers.updateGoal);

// Actions
app.get('/api/actions', apiControllers.getActions);
app.put('/api/actions/:id', apiControllers.toggleAction);

// Daily Logs
app.get('/api/logs', apiControllers.getLogs);
app.post('/api/logs', apiControllers.createLog);
app.get('/api/logs/streaks', apiControllers.getStreaks);

// Green Careers & AI Career Coach
app.get('/api/careers', apiControllers.getCareers);
app.post('/api/careers/recommend', apiControllers.createCareerRecommendation);

// Health Check
app.get('/health', (req, res) => {
  res.json({ status: 'ok', timestamp: new Date() });
});

export default app;
