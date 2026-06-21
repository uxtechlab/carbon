import fs from 'fs/promises';
import { existsSync } from 'fs';
import path from 'path';

export interface CarbonInputs {
  carMileage: number;
  fuelType: 'petrol' | 'diesel' | 'hybrid' | 'electric';
  publicTransitHours: number;
  flightsPerYear: number;
  electricityKwh: number;
  heatingSource: 'gas' | 'electricity' | 'oil' | 'none';
  householdSize: number;
  waterGallonsDaily: number;
  dietType: 'heavy-meat' | 'average-meat' | 'vegetarian' | 'vegan';
  wasteBagsWeekly: number;
  recyclingPercent: number;
}

export interface FootprintRecord {
  id: string;
  date: string; // ISO String
  transport: number; // in kg CO2e
  energy: number; // in kg CO2e
  water: number; // in kg CO2e
  food: number; // in kg CO2e
  waste: number; // in kg CO2e
  total: number; // in kg CO2e
  score: number; // sustainability score (0-100)
  inputs: CarbonInputs;
}

export interface Goal {
  id: string;
  category: 'total' | 'transport' | 'energy' | 'water' | 'food' | 'waste';
  targetValue: number; // target annual kg CO2e (or score for score category)
  targetDate: string; // YYYY-MM-DD
  currentValue: number; // current baseline/level
  completed: boolean;
  createdAt: string; // ISO
}

export interface DailyLog {
  id: string;
  date: string; // YYYY-MM-DD
  transportDistance: number; // miles
  publicTransitTime: number; // hours
  isVegetarian: boolean;
  waterSaved: number; // gallons saved relative to average (e.g. 80-100 gallons avg)
  wasteRecycled: boolean;
  co2Saved: number; // in kg CO2e today
}

export interface ActionItem {
  id: string;
  title: string;
  description: string;
  category: 'transport' | 'energy' | 'water' | 'food' | 'waste';
  co2Reduction: number; // annual savings in kg CO2e
  completed: boolean;
}

export interface DbSchema {
  footprints: FootprintRecord[];
  goals: Goal[];
  logs: DailyLog[];
  actions: ActionItem[];
}

const DB_DIR = path.join(__dirname, '..', 'data');
const DB_FILE = path.join(DB_DIR, 'db.json');

const DEFAULT_ACTIONS: ActionItem[] = [
  {
    id: 'switch-led',
    title: 'Switch to LED bulbs',
    description: 'Replace standard incandescent light bulbs with energy-efficient LEDs.',
    category: 'energy',
    co2Reduction: 150,
    completed: false
  },
  {
    id: 'eat-vegetarian-3',
    title: 'Eat vegetarian 3 days/week',
    description: 'Reduce meat consumption by substituting meat meals with plant-based options.',
    category: 'food',
    co2Reduction: 600,
    completed: false
  },
  {
    id: 'carpool-weekly',
    title: 'Carpool or transit once a week',
    description: 'Use public transportation or share a ride with others for your weekly commute.',
    category: 'transport',
    co2Reduction: 400,
    completed: false
  },
  {
    id: 'smart-thermostat',
    title: 'Install a smart thermostat',
    description: 'Automate heating and cooling settings to reduce idle energy consumption.',
    category: 'energy',
    co2Reduction: 320,
    completed: false
  },
  {
    id: 'reduce-shower-time',
    title: 'Reduce shower time by 3 mins',
    description: 'Save water and water-heating energy by taking shorter, cooler showers.',
    category: 'water',
    co2Reduction: 90,
    completed: false
  },
  {
    id: 'compost-waste',
    title: 'Compost organic waste',
    description: 'Redirect food scraps and organic waste from landfills to home composting.',
    category: 'waste',
    co2Reduction: 120,
    completed: false
  },
  {
    id: 'cold-wash-laundry',
    title: 'Wash laundry in cold water',
    description: 'Use cold water settings for clothes washing, saving heating energy.',
    category: 'energy',
    co2Reduction: 75,
    completed: false
  },
  {
    id: 'buy-local-food',
    title: 'Purchase local & seasonal produce',
    description: 'Reduce food transport emissions (food miles) by buying local items.',
    category: 'food',
    co2Reduction: 250,
    completed: false
  }
];

export class Database {
  private static instance: Database;
  private memoryDb: DbSchema | null = null;
  private writePromise: Promise<void> = Promise.resolve();

  private constructor() {}

  public static getInstance(): Database {
    if (!Database.instance) {
      Database.instance = new Database();
    }
    return Database.instance;
  }

  private async ensureInitialized(): Promise<DbSchema> {
    if (this.memoryDb) return this.memoryDb;

    try {
      await fs.mkdir(DB_DIR, { recursive: true });
      if (existsSync(DB_FILE)) {
        const data = await fs.readFile(DB_FILE, 'utf-8');
        this.memoryDb = JSON.parse(data) as DbSchema;
      } else {
        this.memoryDb = {
          footprints: [],
          goals: [],
          logs: [],
          actions: DEFAULT_ACTIONS
        };
        await this.save(this.memoryDb);
      }
    } catch (error) {
      console.error('Failed to initialize database, falling back to in-memory', error);
      this.memoryDb = {
        footprints: [],
        goals: [],
        logs: [],
        actions: DEFAULT_ACTIONS
      };
    }
    return this.memoryDb;
  }

  private async save(db: DbSchema): Promise<void> {
    // Basic write lock using a promise chain to prevent race conditions
    this.writePromise = this.writePromise.then(async () => {
      try {
        await fs.mkdir(DB_DIR, { recursive: true });
        const tempFile = `${DB_FILE}.tmp`;
        await fs.writeFile(tempFile, JSON.stringify(db, null, 2), 'utf-8');
        await fs.rename(tempFile, DB_FILE);
      } catch (error) {
        console.error('Failed to write to local DB file:', error);
      }
    });
    return this.writePromise;
  }

  // Footprint Methods
  public async getFootprints(): Promise<FootprintRecord[]> {
    const db = await this.ensureInitialized();
    return db.footprints;
  }

  public async addFootprint(record: FootprintRecord): Promise<FootprintRecord> {
    const db = await this.ensureInitialized();
    db.footprints.push(record);
    await this.save(db);
    return record;
  }

  // Goal Methods
  public async getGoals(): Promise<Goal[]> {
    const db = await this.ensureInitialized();
    return db.goals;
  }

  public async addGoal(goal: Goal): Promise<Goal> {
    const db = await this.ensureInitialized();
    db.goals.push(goal);
    await this.save(db);
    return goal;
  }

  public async updateGoalProgress(id: string, currentValue: number, completed: boolean): Promise<Goal | null> {
    const db = await this.ensureInitialized();
    const index = db.goals.findIndex(g => g.id === id);
    if (index === -1) return null;
    db.goals[index] = { ...db.goals[index], currentValue, completed };
    await this.save(db);
    return db.goals[index];
  }

  // Daily Log Methods
  public async getLogs(): Promise<DailyLog[]> {
    const db = await this.ensureInitialized();
    return db.logs;
  }

  public async addLog(log: DailyLog): Promise<DailyLog> {
    const db = await this.ensureInitialized();
    // Check if entry for date already exists, if so overwrite, else push
    const index = db.logs.findIndex(l => l.date === log.date);
    if (index !== -1) {
      db.logs[index] = log;
    } else {
      db.logs.push(log);
    }
    await this.save(db);
    return log;
  }

  // Actions Methods
  public async getActions(): Promise<ActionItem[]> {
    const db = await this.ensureInitialized();
    return db.actions;
  }

  public async toggleAction(id: string, completed: boolean): Promise<ActionItem | null> {
    const db = await this.ensureInitialized();
    const index = db.actions.findIndex(a => a.id === id);
    if (index === -1) return null;
    db.actions[index].completed = completed;
    await this.save(db);
    return db.actions[index];
  }

  // Clear Database (for testing purposes)
  public async reset(): Promise<void> {
    this.memoryDb = {
      footprints: [],
      goals: [],
      logs: [],
      actions: DEFAULT_ACTIONS
    };
    await this.save(this.memoryDb);
  }
}
