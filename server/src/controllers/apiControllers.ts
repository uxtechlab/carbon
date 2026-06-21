import { Request, Response } from 'express';
import { z } from 'zod';
import { Database, CarbonInputs, FootprintRecord, Goal, DailyLog, ActionItem } from '../models/db';
import { CoachService } from '../services/coachService';

const db = Database.getInstance();
const coachService = new CoachService();

// Validation Schemas
const carbonInputsSchema = z.object({
  carMileage: z.number().min(0),
  fuelType: z.enum(['petrol', 'diesel', 'hybrid', 'electric']),
  publicTransitHours: z.number().min(0),
  flightsPerYear: z.number().min(0),
  electricityKwh: z.number().min(0),
  heatingSource: z.enum(['gas', 'electricity', 'oil', 'none']),
  householdSize: z.number().min(1),
  waterGallonsDaily: z.number().min(0),
  dietType: z.enum(['heavy-meat', 'average-meat', 'vegetarian', 'vegan']),
  wasteBagsWeekly: z.number().min(0),
  recyclingPercent: z.number().min(0).max(100)
});

const goalSchema = z.object({
  category: z.enum(['total', 'transport', 'energy', 'water', 'food', 'waste']),
  targetValue: z.number().min(0),
  targetDate: z.string().regex(/^\d{4}-\d{2}-\d{2}$/, 'Must be YYYY-MM-DD')
});

const dailyLogSchema = z.object({
  date: z.string().regex(/^\d{4}-\d{2}-\d{2}$/, 'Must be YYYY-MM-DD'),
  transportDistance: z.number().min(0),
  publicTransitTime: z.number().min(0),
  isVegetarian: z.boolean(),
  waterSaved: z.number().min(0),
  wasteRecycled: z.boolean()
});

// Helper: Calculate Footprint
export function calculateFootprint(inputs: CarbonInputs): Omit<FootprintRecord, 'id' | 'date'> {
  // 1. Transport CO2 (annual kg)
  let carFactor = 0.40; // petrol
  if (inputs.fuelType === 'diesel') carFactor = 0.38;
  else if (inputs.fuelType === 'hybrid') carFactor = 0.20;
  else if (inputs.fuelType === 'electric') carFactor = 0.10;
  
  const carCO2 = inputs.carMileage * carFactor;
  const transitCO2 = inputs.publicTransitHours * 52 * 1.2; // 1.2 kg per hour of bus/train
  const flightsCO2 = inputs.flightsPerYear * 280; // 280 kg CO2 per flight
  const transport = carCO2 + transitCO2 + flightsCO2;

  // 2. Home Energy CO2 (annual kg, divided by household size)
  const annualElectricity = inputs.electricityKwh * 12;
  const electricityCO2 = (annualElectricity * 0.38) / inputs.householdSize; // 0.38 kg per kWh US/Global avg
  
  let heatingCO2 = 0;
  if (inputs.heatingSource === 'gas') heatingCO2 = 1200 / inputs.householdSize;
  else if (inputs.heatingSource === 'oil') heatingCO2 = 1800 / inputs.householdSize;
  else if (inputs.heatingSource === 'electricity') heatingCO2 = 600 / inputs.householdSize;
  
  const energy = electricityCO2 + heatingCO2;

  // 3. Water CO2 (annual kg, pumping + water heating)
  const annualWater = inputs.waterGallonsDaily * 365;
  const water = annualWater * 0.0035; // 0.0035 kg CO2 per gallon

  // 4. Food CO2 (annual kg)
  let food = 2500; // average meat eater
  if (inputs.dietType === 'heavy-meat') food = 3300;
  else if (inputs.dietType === 'vegetarian') food = 1700;
  else if (inputs.dietType === 'vegan') food = 1200;

  // 5. Waste CO2 (annual kg)
  const baseWaste = inputs.wasteBagsWeekly * 52 * 4.5; // 4.5 kg CO2 per trash bag
  const recyclingOffset = baseWaste * (inputs.recyclingPercent / 100) * 0.40; // 40% reduction for materials recycled
  const waste = Math.max(0, baseWaste - recyclingOffset);

  const total = transport + energy + water + food + waste;

  // 6. Sustainability Score (0-100)
  // Sustainable target: 2,000 kg/year. Typical high country baseline: 16,000 kg/year.
  // score = 100 at 2 tons, score = 10 at 16 tons
  let score = 100;
  if (total > 2000) {
    const penalty = ((total - 2000) / (16000 - 2000)) * 90;
    score = Math.max(10, Math.min(100, Math.round(100 - penalty)));
  }

  return {
    transport: Math.round(transport),
    energy: Math.round(energy),
    water: Math.round(water),
    food: Math.round(food),
    waste: Math.round(waste),
    total: Math.round(total),
    score: Math.round(score),
    inputs
  };
}

// Controller Handlers
export const apiControllers = {
  // Footprints
  async createFootprint(req: Request, res: Response) {
    try {
      const inputs = carbonInputsSchema.parse(req.body);
      const calculated = calculateFootprint(inputs);
      
      const record: FootprintRecord = {
        id: Math.random().toString(36).substring(2, 11),
        date: new Date().toISOString(),
        ...calculated
      };

      await db.addFootprint(record);
      res.status(201).json(record);
    } catch (error) {
      if (error instanceof z.ZodError) {
        res.status(400).json({ error: 'Validation Error', details: error.errors });
      } else {
        res.status(500).json({ error: 'Server Error' });
      }
    }
  },

  async getFootprints(req: Request, res: Response) {
    try {
      const footprints = await db.getFootprints();
      res.json(footprints);
    } catch (error) {
      res.status(500).json({ error: 'Server Error' });
    }
  },

  // AI Carbon Coach
  async getCoachAnalysis(req: Request, res: Response) {
    try {
      const footprints = await db.getFootprints();
      if (footprints.length === 0) {
        return res.status(400).json({ error: 'No carbon footprint record found. Please complete a calculation first.' });
      }
      
      // Analyze latest record
      const latest = footprints[footprints.length - 1];
      const analysis = await coachService.analyzeFootprint(latest);
      res.json(analysis);
    } catch (error) {
      console.error(error);
      res.status(500).json({ error: 'Server Error analyzing footprint' });
    }
  },

  // Goals
  async getGoals(req: Request, res: Response) {
    try {
      const goals = await db.getGoals();
      res.json(goals);
    } catch (error) {
      res.status(500).json({ error: 'Server Error' });
    }
  },

  async createGoal(req: Request, res: Response) {
    try {
      const { category, targetValue, targetDate } = goalSchema.parse(req.body);
      const footprints = await db.getFootprints();
      
      // Calculate current baseline based on latest footprint
      let currentValue = 0;
      if (footprints.length > 0) {
        const latest = footprints[footprints.length - 1];
        if (category === 'total') currentValue = latest.total;
        else if (category === 'transport') currentValue = latest.transport;
        else if (category === 'energy') currentValue = latest.energy;
        else if (category === 'water') currentValue = latest.water;
        else if (category === 'food') currentValue = latest.food;
        else if (category === 'waste') currentValue = latest.waste;
      }

      const goal: Goal = {
        id: Math.random().toString(36).substring(2, 11),
        category,
        targetValue,
        targetDate,
        currentValue,
        completed: false,
        createdAt: new Date().toISOString()
      };

      await db.addGoal(goal);
      res.status(201).json(goal);
    } catch (error) {
      if (error instanceof z.ZodError) {
        res.status(400).json({ error: 'Validation Error', details: error.errors });
      } else {
        res.status(500).json({ error: 'Server Error' });
      }
    }
  },

  async updateGoal(req: Request, res: Response) {
    try {
      const { id } = req.params;
      const { currentValue, completed } = req.body;
      if (typeof currentValue !== 'number' || typeof completed !== 'boolean') {
        return res.status(400).json({ error: 'Invalid body parameters' });
      }
      const updated = await db.updateGoalProgress(id, currentValue, completed);
      if (!updated) {
        return res.status(404).json({ error: 'Goal not found' });
      }
      res.json(updated);
    } catch (error) {
      res.status(500).json({ error: 'Server Error' });
    }
  },

  // Actions
  async getActions(req: Request, res: Response) {
    try {
      const actions = await db.getActions();
      res.json(actions);
    } catch (error) {
      res.status(500).json({ error: 'Server Error' });
    }
  },

  async toggleAction(req: Request, res: Response) {
    try {
      const { id } = req.params;
      const { completed } = req.body;
      if (typeof completed !== 'boolean') {
        return res.status(400).json({ error: 'completed must be a boolean' });
      }
      const updated = await db.toggleAction(id, completed);
      if (!updated) {
        return res.status(404).json({ error: 'Action item not found' });
      }
      res.json(updated);
    } catch (error) {
      res.status(500).json({ error: 'Server Error' });
    }
  },

  // Daily logs & Streaks
  async getLogs(req: Request, res: Response) {
    try {
      const logs = await db.getLogs();
      res.json(logs);
    } catch (error) {
      res.status(500).json({ error: 'Server Error' });
    }
  },

  async createLog(req: Request, res: Response) {
    try {
      const body = dailyLogSchema.parse(req.body);
      const footprints = await db.getFootprints();
      
      // Calculate carbon saved relative to baseline
      // Average daily carbon footprint = annual footprint / 365
      let dailyBaseline = 15; // default 15 kg CO2e / day (average western)
      if (footprints.length > 0) {
        dailyBaseline = footprints[footprints.length - 1].total / 365;
      }

      // Calculate today's emissions:
      // - Transport: 0.35 kg CO2e per car mile
      // - Public transit: 0.8 kg CO2e per hour
      // - Diet: vegetarian = 4.6 kg/day, meat = 8.2 kg/day
      // - Waste: recycled today saves 0.7 kg CO2
      const todayTransport = body.transportDistance * 0.35 + body.publicTransitTime * 0.8;
      const todayFood = body.isVegetarian ? 4.6 : 8.2;
      const todayWasteBase = 1.2;
      const todayWaste = body.wasteRecycled ? 0.5 : todayWasteBase;
      const todayWater = 0.5 - (body.waterSaved * 0.0035); // water treatment emissions

      const totalToday = todayTransport + todayFood + todayWaste + todayWater;
      const co2Saved = Math.max(0, dailyBaseline - totalToday);

      const log: DailyLog = {
        id: Math.random().toString(36).substring(2, 11),
        date: body.date,
        transportDistance: body.transportDistance,
        publicTransitTime: body.publicTransitTime,
        isVegetarian: body.isVegetarian,
        waterSaved: body.waterSaved,
        wasteRecycled: body.wasteRecycled,
        co2Saved: Number(co2Saved.toFixed(2))
      };

      await db.addLog(log);
      res.status(201).json(log);
    } catch (error) {
      if (error instanceof z.ZodError) {
        res.status(400).json({ error: 'Validation Error', details: error.errors });
      } else {
        res.status(500).json({ error: 'Server Error' });
      }
    }
  },

  async getStreaks(req: Request, res: Response) {
    try {
      const logs = await db.getLogs();
      if (logs.length === 0) {
        return res.json({ currentStreak: 0, longestStreak: 0, badges: [] });
      }

      // Sort logs by date ascending
      const sortedLogs = [...logs].sort((a, b) => a.date.localeCompare(b.date));

      // Calculate streaks
      let currentStreak = 0;
      let longestStreak = 0;
      let tempStreak = 0;

      const oneDayMs = 24 * 60 * 60 * 1000;
      let prevDate: Date | null = null;

      for (const log of sortedLogs) {
        const currentDate = new Date(log.date);
        
        if (prevDate === null) {
          tempStreak = 1;
        } else {
          const diffTime = Math.abs(currentDate.getTime() - prevDate.getTime());
          const diffDays = Math.ceil(diffTime / oneDayMs);
          
          if (diffDays === 1) {
            tempStreak++;
          } else if (diffDays > 1) {
            tempStreak = 1;
          }
        }
        
        if (tempStreak > longestStreak) {
          longestStreak = tempStreak;
        }
        prevDate = currentDate;
      }

      // Check if current streak is still active today or yesterday
      const todayStr = new Date().toISOString().split('T')[0];
      const yesterdayStr = new Date(Date.now() - oneDayMs).toISOString().split('T')[0];
      const hasLoggedRecently = logs.some(l => l.date === todayStr || l.date === yesterdayStr);

      currentStreak = hasLoggedRecently ? tempStreak : 0;

      // Badges check
      const badges = [];
      if (logs.length >= 1) badges.push({ id: 'first-step', name: 'First Action', description: 'Log your first daily ecological activity.', icon: '🌱' });
      if (logs.length >= 7) badges.push({ id: 'eco-week', name: 'Eco Week', description: 'Log daily activities for 7 days.', icon: '📅' });
      if (currentStreak >= 3) badges.push({ id: 'streak-3', name: 'Habit Builder', description: 'Achieve a 3-day eco-logging streak.', icon: '🔥' });
      if (logs.filter(l => l.isVegetarian).length >= 5) badges.push({ id: 'plant-power', name: 'Plant Powered', description: 'Log 5 vegetarian or vegan days.', icon: '🥦' });
      if (logs.filter(l => l.co2Saved > 5).length >= 3) badges.push({ id: 'carbon-slayer', name: 'Carbon Slayer', description: 'Save more than 5kg CO2 in a single day 3 times.', icon: '🛡️' });

      res.json({
        currentStreak,
        longestStreak,
        badges
      });
    } catch (error) {
      res.status(500).json({ error: 'Server Error' });
    }
  },

  // Careers & Advisor
  async getCareers(req: Request, res: Response) {
    try {
      const { CURATED_CAREERS } = await import('../services/careerService');
      res.json(CURATED_CAREERS);
    } catch (error) {
      res.status(500).json({ error: 'Server Error fetching careers' });
    }
  },

  async createCareerRecommendation(req: Request, res: Response) {
    try {
      const { CareerService } = await import('../services/careerService');
      const careerService = new CareerService();
      
      const { skills, interest } = req.body;
      if (typeof skills !== 'string' || typeof interest !== 'string') {
        return res.status(400).json({ error: 'skills and interest must be strings' });
      }

      const recommendation = await careerService.getRecommendation(skills, interest);
      res.json(recommendation);
    } catch (error) {
      console.error(error);
      res.status(500).json({ error: 'Server Error recommending career' });
    }
  }
};
