import React, { createContext, useContext, useState, useEffect } from 'react';

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
  date: string;
  transport: number;
  energy: number;
  water: number;
  food: number;
  waste: number;
  total: number;
  score: number;
  inputs: CarbonInputs;
}

export interface Goal {
  id: string;
  category: 'total' | 'transport' | 'energy' | 'water' | 'food' | 'waste';
  targetValue: number;
  targetDate: string;
  currentValue: number;
  completed: boolean;
  createdAt: string;
}

export interface DailyLog {
  id: string;
  date: string;
  transportDistance: number;
  publicTransitTime: number;
  isVegetarian: boolean;
  waterSaved: number;
  wasteRecycled: boolean;
  co2Saved: number;
}

export interface ActionItem {
  id: string;
  title: string;
  description: string;
  category: 'transport' | 'energy' | 'water' | 'food' | 'waste';
  co2Reduction: number;
  completed: boolean;
}

export interface StreakStats {
  currentStreak: number;
  longestStreak: number;
  badges: { id: string; name: string; description: string; icon: string }[];
}

export interface GreenCareer {
  id: string;
  title: string;
  description: string;
  category: 'tech-ai' | 'data-science' | 'renewable-energy' | 'policy-consulting' | 'circular-economy';
  co2ReductionPotential: number; // tons of CO2 offset annually
  skillsRequired: string[];
  demandLevel: 'High' | 'Very High' | 'Moderate';
  salaryRange: string;
}

export interface CareerRecommendation {
  career: GreenCareer;
  matchingExplanation: string;
  roadmap: string; // Markdown formatted roadmap
}

interface AppContextType {
  footprints: FootprintRecord[];
  goals: Goal[];
  logs: DailyLog[];
  actions: ActionItem[];
  streaks: StreakStats;
  careers: GreenCareer[];
  recommendedCareer: CareerRecommendation | null;
  recommendationLoading: boolean;
  loading: boolean;
  coachAnalysis: { analysis: string; recommendations: string[]; topSource: string } | null;
  coachLoading: boolean;
  activeTab: string;
  setActiveTab: (tab: string) => void;
  calculateCarbon: (inputs: CarbonInputs) => Promise<FootprintRecord>;
  createGoal: (goal: Omit<Goal, 'id' | 'currentValue' | 'completed' | 'createdAt'>) => Promise<Goal>;
  updateGoalProgress: (id: string, value: number, completed: boolean) => Promise<void>;
  toggleActionItem: (id: string, completed: boolean) => Promise<void>;
  logDailyHabit: (log: Omit<DailyLog, 'id' | 'co2Saved'>) => Promise<DailyLog>;
  getCoachReport: () => Promise<void>;
  recommendCareerPath: (skills: string, interest: string) => Promise<CareerRecommendation>;
  refreshAllData: () => Promise<void>;
  isUsingFallback: boolean;
}

const AppContext = createContext<AppContextType | undefined>(undefined);

const API_BASE = 'http://localhost:5000/api';

const DEFAULT_ACTIONS: ActionItem[] = [
  { id: 'switch-led', title: 'Switch to LED bulbs', description: 'Replace standard light bulbs with energy-efficient LEDs.', category: 'energy', co2Reduction: 150, completed: false },
  { id: 'eat-vegetarian-3', title: 'Eat vegetarian 3 days/week', description: 'Reduce meat consumption by substituting meat meals with plant-based options.', category: 'food', co2Reduction: 600, completed: false },
  { id: 'carpool-weekly', title: 'Carpool or transit once a week', description: 'Use public transportation or share a ride with others for your weekly commute.', category: 'transport', co2Reduction: 400, completed: false },
  { id: 'smart-thermostat', title: 'Install a smart thermostat', description: 'Automate heating and cooling settings to reduce idle energy consumption.', category: 'energy', co2Reduction: 320, completed: false },
  { id: 'reduce-shower-time', title: 'Reduce shower time by 3 mins', description: 'Save water and heating energy by taking shorter showers.', category: 'water', co2Reduction: 90, completed: false },
  { id: 'compost-waste', title: 'Compost organic waste', description: 'Redirect food scraps and organic waste from landfills to composting.', category: 'waste', co2Reduction: 120, completed: false },
  { id: 'cold-wash-laundry', title: 'Wash laundry in cold water', description: 'Use cold water settings for clothes washing, saving heating energy.', category: 'energy', co2Reduction: 75, completed: false },
  { id: 'buy-local-food', title: 'Purchase local & seasonal produce', description: 'Reduce food transport emissions by buying local items.', category: 'food', co2Reduction: 250, completed: false }
];

const CURATED_CAREERS: GreenCareer[] = [
  {
    id: 'climate-ai-engineer',
    title: '🤖 Climate AI Engineer',
    description: 'Apply machine learning models to optimize smart electrical grids, predict extreme climate events, and manage automated carbon capture facilities.',
    category: 'tech-ai',
    co2ReductionPotential: 12.5,
    skillsRequired: ['Python', 'Machine Learning', 'TensorFlow/PyTorch', 'Data Analysis', 'Climate Science basics'],
    demandLevel: 'Very High',
    salaryRange: '$110,000 - $170,000'
  },
  {
    id: 'sustainability-software-developer',
    title: '🌱 Sustainability Software Developer',
    description: 'Build enterprise-grade software to track corporate ESG targets, model resource supply chains, and power carbon calculation API engines.',
    category: 'tech-ai',
    co2ReductionPotential: 8.0,
    skillsRequired: ['JavaScript/TypeScript', 'React/Next.js', 'Node.js', 'SQL/NoSQL', 'API Design', 'Green Coding practices'],
    demandLevel: 'High',
    salaryRange: '$90,000 - $145,000'
  },
  {
    id: 'climate-data-analyst',
    title: '📊 Climate Data Analyst',
    description: 'Analyze satellite Earth observation datasets, weather sensor arrays, and greenhouse gas metrics to build actionable climate impact reports.',
    category: 'data-science',
    co2ReductionPotential: 6.5,
    skillsRequired: ['R/Python', 'SQL', 'GIS mapping', 'Tableau/PowerBI', 'Statistical Modeling'],
    demandLevel: 'High',
    salaryRange: '$75,000 - $115,000'
  },
  {
    id: 'smart-grid-architect',
    title: '⚡ Smart Grid Architect',
    description: 'Design electrical distribution systems that dynamically integrate high percentages of intermittent wind, solar, and battery storage capacity.',
    category: 'renewable-energy',
    co2ReductionPotential: 25.0,
    skillsRequired: ['Electrical Engineering', 'Smart Grid Protocols', 'IoT', 'SCADA systems', 'Energy Storage modeling'],
    demandLevel: 'Very High',
    salaryRange: '$120,000 - $190,000'
  },
  {
    id: 'renewable-energy-specialist',
    title: '🌞 Renewable Energy Specialist',
    description: 'Oversee the design, installation, feasibility assessment, and output management of residential and industrial solar and wind generator installations.',
    category: 'renewable-energy',
    co2ReductionPotential: 18.0,
    skillsRequired: ['Solar/Wind Physics', 'CAD modeling', 'Project Management', 'Grid Interconnection specs'],
    demandLevel: 'High',
    salaryRange: '$80,000 - $130,000'
  },
  {
    id: 'circular-design-engineer',
    title: '🔄 Circular Design Engineer',
    description: 'Re-engineer physical products, components, and packaging to eliminate waste, design for disassembly, and ensure materials can be 100% recycled or biodegraded.',
    category: 'circular-economy',
    co2ReductionPotential: 15.5,
    skillsRequired: ['Materials Science', 'CAD/SolidWorks', 'Lifecycle Assessment (LCA)', 'Industrial Design'],
    demandLevel: 'High',
    salaryRange: '$85,000 - $140,000'
  },
  {
    id: 'carbon-accounting-consultant',
    title: '💼 Carbon Accounting Consultant',
    description: 'Help organizations perform greenhouse gas inventory audits (Scopes 1, 2, and 3), verify offset portfolios, and publish ESG regulatory compliance files.',
    category: 'policy-consulting',
    co2ReductionPotential: 14.0,
    skillsRequired: ['GHG Protocol standards', 'Carbon auditing', 'Corporate consulting', 'Financial modeling', 'Communication'],
    demandLevel: 'Very High',
    salaryRange: '$85,000 - $150,000'
  },
  {
    id: 'eco-policy-analyst',
    title: '🌍 Eco Policy Analyst',
    description: 'Research, evaluate, and design regional regulatory proposals, incentive structures, and municipal plans for urban carbon reductions and green transport expansion.',
    category: 'policy-consulting',
    co2ReductionPotential: 5.0,
    skillsRequired: ['Environmental Law', 'Policy writing', 'Economics', 'Community advocacy', 'Data analysis'],
    demandLevel: 'Moderate',
    salaryRange: '$70,000 - $110,000'
  }
];

export const AppProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [footprints, setFootprints] = useState<FootprintRecord[]>([]);
  const [goals, setGoals] = useState<Goal[]>([]);
  const [logs, setLogs] = useState<DailyLog[]>([]);
  const [actions, setActions] = useState<ActionItem[]>(DEFAULT_ACTIONS);
  const [streaks, setStreaks] = useState<StreakStats>({ currentStreak: 0, longestStreak: 0, badges: [] });
  const [careers, setCareers] = useState<GreenCareer[]>(CURATED_CAREERS);
  const [recommendedCareer, setRecommendedCareer] = useState<CareerRecommendation | null>(null);
  const [recommendationLoading, setRecommendationLoading] = useState(false);
  const [loading, setLoading] = useState(true);
  const [coachAnalysis, setCoachAnalysis] = useState<AppContextType['coachAnalysis']>(null);
  const [coachLoading, setCoachLoading] = useState(false);
  const [activeTab, setActiveTab] = useState('dashboard');
  const [isUsingFallback, setIsUsingFallback] = useState(false);

  // Core Math Fallback
  const calculateLocalEmissions = (inputs: CarbonInputs): Omit<FootprintRecord, 'id' | 'date'> => {
    let carFactor = 0.40;
    if (inputs.fuelType === 'diesel') carFactor = 0.38;
    else if (inputs.fuelType === 'hybrid') carFactor = 0.20;
    else if (inputs.fuelType === 'electric') carFactor = 0.10;
    
    const carCO2 = inputs.carMileage * carFactor;
    const transitCO2 = inputs.publicTransitHours * 52 * 1.2;
    const flightsCO2 = inputs.flightsPerYear * 280;
    const transport = carCO2 + transitCO2 + flightsCO2;

    const annualElectricity = inputs.electricityKwh * 12;
    const electricityCO2 = (annualElectricity * 0.38) / inputs.householdSize;
    
    let heatingCO2 = 0;
    if (inputs.heatingSource === 'gas') heatingCO2 = 1200 / inputs.householdSize;
    else if (inputs.heatingSource === 'oil') heatingCO2 = 1800 / inputs.householdSize;
    else if (inputs.heatingSource === 'electricity') heatingCO2 = 600 / inputs.householdSize;
    
    const energy = electricityCO2 + heatingCO2;
    const water = inputs.waterGallonsDaily * 365 * 0.0035;

    let food = 2500;
    if (inputs.dietType === 'heavy-meat') food = 3300;
    else if (inputs.dietType === 'vegetarian') food = 1700;
    else if (inputs.dietType === 'vegan') food = 1200;

    const baseWaste = inputs.wasteBagsWeekly * 52 * 4.5;
    const recyclingOffset = baseWaste * (inputs.recyclingPercent / 100) * 0.40;
    const waste = Math.max(0, baseWaste - recyclingOffset);

    const total = transport + energy + water + food + waste;

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
  };

  // Heuristic Coach analysis for local mode
  const getLocalCoachAnalysis = (record: FootprintRecord): AppContextType['coachAnalysis'] => {
    const { transport, energy, water, food, waste, total, score, inputs } = record;
    const categories = [
      { name: 'Transportation', value: transport },
      { name: 'Home Energy', value: energy },
      { name: 'Water Consumption', value: water },
      { name: 'Diet & Food Habits', value: food },
      { name: 'Waste & Consumption', value: waste }
    ];
    categories.sort((a, b) => b.value - a.value);
    const topSource = categories[0].name;

    const recs = [];
    if (topSource === 'Transportation') {
      recs.push('Switch 15% of solo driving to biking or train commutes.');
      recs.push('Keep tires properly inflated to save 3% fuel.');
      recs.push('Consolidate long distance travel to reduce flight usage.');
    } else if (topSource === 'Home Energy') {
      recs.push('Wash clothes in cold water settings to save heater draw.');
      recs.push('Install LED light bulbs throughout common areas.');
      recs.push('Set your thermostat 2 degrees warmer in summer/cooler in winter.');
    } else if (topSource === 'Diet & Food Habits') {
      recs.push('Try doing 2 meat-free days per week (saves ~300kg/yr).');
      recs.push('Decrease dairy cheese intake and use plant-based milk.');
      recs.push('Plan grocery runs carefully to eliminate raw food spoilage.');
    } else if (topSource === 'Water Consumption') {
      recs.push('Install simple low-flow faucet aerators.');
      recs.push('Reduce shower lengths by 3 minutes.');
      recs.push('Fix toilet leaks which can waste hundreds of gallons.');
    } else {
      recs.push('Recycle paper, aluminum, and plastic sorting diligently.');
      recs.push('Avoid single-use cups by bringing reusable travel mugs.');
      recs.push('Purchase clothes second hand and mend fabric damages.');
    }

    const percentage = ((categories.find(c => c.name === topSource)?.value || 0) / total * 100).toFixed(0);

    const text = `### 🌿 EcoCoach AI Local Report

Your calculated carbon footprint is **${(total / 1000).toFixed(1)} metric tons CO2e/year**, receiving a Sustainability Score of **${score}/100**.

Your main emission source is **${topSource}**, which accounts for **${percentage}%** of your global footprint.

#### 📈 Key Insights:
- Living in a ${inputs.householdSize}-person house means utilities share load, but energy remains a crucial area.
- Eating a **${inputs.dietType}** diet impacts food-chain supply emission limits.
- Logging daily habits will help build critical streaks and unlock badges!`;

    return {
      analysis: text,
      recommendations: recs,
      topSource
    };
  };

  const calculateLocalStreaks = (allLogs: DailyLog[]): StreakStats => {
    if (allLogs.length === 0) return { currentStreak: 0, longestStreak: 0, badges: [] };

    const sorted = [...allLogs].sort((a, b) => a.date.localeCompare(b.date));
    let currentStreak = 0;
    let longestStreak = 0;
    let tempStreak = 0;

    const oneDayMs = 24 * 60 * 60 * 1000;
    let prevDate: Date | null = null;

    for (const log of sorted) {
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
      if (tempStreak > longestStreak) longestStreak = tempStreak;
      prevDate = currentDate;
    }

    const todayStr = new Date().toISOString().split('T')[0];
    const yesterdayStr = new Date(Date.now() - oneDayMs).toISOString().split('T')[0];
    const active = allLogs.some(l => l.date === todayStr || l.date === yesterdayStr);
    currentStreak = active ? tempStreak : 0;

    const badges = [];
    if (allLogs.length >= 1) badges.push({ id: 'first-step', name: 'First Action', description: 'Log your first daily ecological activity.', icon: '🌱' });
    if (allLogs.length >= 7) badges.push({ id: 'eco-week', name: 'Eco Week', description: 'Log daily activities for 7 days.', icon: '📅' });
    if (currentStreak >= 3) badges.push({ id: 'streak-3', name: 'Habit Builder', description: 'Achieve a 3-day eco-logging streak.', icon: '🔥' });
    if (allLogs.filter(l => l.isVegetarian).length >= 5) badges.push({ id: 'plant-power', name: 'Plant Powered', description: 'Log 5 vegetarian or vegan days.', icon: '🥦' });
    if (allLogs.filter(l => l.co2Saved > 5).length >= 3) badges.push({ id: 'carbon-slayer', name: 'Carbon Slayer', description: 'Save more than 5kg CO2 in a single day 3 times.', icon: '🛡️' });

    return { currentStreak, longestStreak, badges };
  };

  // Local Career Matching Fallback
  const recommendLocalCareer = (userSkills: string, interest: string): CareerRecommendation => {
    const skillsLower = userSkills.toLowerCase();
    let matchedCareer = CURATED_CAREERS[0];

    if (interest === 'tech-ai') {
      if (skillsLower.includes('python') || skillsLower.includes('ml') || skillsLower.includes('data') || skillsLower.includes('ai')) {
        matchedCareer = CURATED_CAREERS.find(c => c.id === 'climate-ai-engineer') || CURATED_CAREERS[0];
      } else {
        matchedCareer = CURATED_CAREERS.find(c => c.id === 'sustainability-software-developer') || CURATED_CAREERS[0];
      }
    } else if (interest === 'data-science') {
      matchedCareer = CURATED_CAREERS.find(c => c.id === 'climate-data-analyst') || CURATED_CAREERS[2];
    } else if (interest === 'renewable-energy') {
      if (skillsLower.includes('engineering') || skillsLower.includes('cad') || skillsLower.includes('math') || skillsLower.includes('electric')) {
        matchedCareer = CURATED_CAREERS.find(c => c.id === 'smart-grid-architect') || CURATED_CAREERS[3];
      } else {
        matchedCareer = CURATED_CAREERS.find(c => c.id === 'renewable-energy-specialist') || CURATED_CAREERS[4];
      }
    } else if (interest === 'circular-economy') {
      matchedCareer = CURATED_CAREERS.find(c => c.id === 'circular-design-engineer') || CURATED_CAREERS[5];
    } else if (interest === 'policy-consulting') {
      if (skillsLower.includes('audit') || skillsLower.includes('accounting') || skillsLower.includes('finance') || skillsLower.includes('business')) {
        matchedCareer = CURATED_CAREERS.find(c => c.id === 'carbon-accounting-consultant') || CURATED_CAREERS[6];
      } else {
        matchedCareer = CURATED_CAREERS.find(c => c.id === 'eco-policy-analyst') || CURATED_CAREERS[7];
      }
    }

    const explanation = `Based on your skills in **"${userSkills}"** and interest in **"${interest.replace('-', ' ')}"**, we recommend the path of a **${matchedCareer.title}**. Your background gives you a strong foundation to build on. Transitioning to this role will allow you to reduce CO2 emissions by up to **${matchedCareer.co2ReductionPotential} tons** annually through systemic industrial and structural shifts.`;
    
    // Generate static roadmap
    let roadmap = `### 🗺️ Career Transition Roadmap: ${matchedCareer.title}

Here is a structured transition path prepared by EcoCoach AI to leverage your existing skillset (**${userSkills}**) and prepare you for a professional green impact role.

#### 📈 Phase 1: Core Fundamentals & Bridging the Gap (Months 1-3)
* **Goal**: Acquire foundational knowledge in sustainability frameworks and specialized technical protocols.
* **Topics to learn**:
  ${matchedCareer.category === 'tech-ai' || matchedCareer.category === 'data-science' 
    ? `- Master green coding principles and energy-efficient algorithm structures.\n- Complete foundational courses on climate science data patterns.` 
    : ''}
  ${matchedCareer.category === 'renewable-energy' 
    ? `- Study smart grid integration concepts, AC/DC load factors, and battery chemistries.\n- Complete training on PV design software (e.g. PVsyst or CAD).` 
    : ''}
  ${matchedCareer.category === 'circular-economy' 
    ? `- Learn Life Cycle Assessment (LCA) software (e.g., SimaPro, openLCA).\n- Read Cradle-to-Cradle engineering principles.` 
    : ''}
  ${matchedCareer.category === 'policy-consulting' 
    ? `- Memorize Scopes 1, 2, and 3 emissions auditing rules under the GHG Protocol.\n- Study global reporting frameworks (ESG, GRI, SASB).` 
    : ''}
* **Action Item**: Spend 4-6 hours a week reading publications from organizations like the National Renewable Energy Lab (NREL) or the World Resources Institute (WRI).

#### 🛠️ Phase 2: Building your Green Portfolio (Months 3-6)
* **Goal**: Build practical, hands-on evidence of your capacity to solve sustainability problems.
* **Project Ideas**:
  - **Project 1**: Build a local carbon emissions analysis dashboard or tracking script utilizing real API datasets.
  - **Project 2**: Perform an environmental impact audit or design a waste reduction proposal for your current employer or a local organization.
  - **Project 3**: Write a comprehensive case study evaluating the efficiency and grid-impact of a local renewable installation.
* **Action Item**: Publish your code and case studies openly on GitHub and share summaries on LinkedIn to display domain knowledge.

#### 👥 Phase 3: Community Networking & Authority Building (Months 6-9)
* **Goal**: Connect with established climate tech professionals and join domain communities.
* **Recommended Communities**:
  - Join **Work on Climate** or **My Climate Journey (MCJ)** Slack communities.
  - Participate in local sustainability meetups, clean energy hackathons, or climate-focused open source repositories.
* **Action Item**: Conduct at least 3 informational interviews with professionals working in your target role. Ask them about their daily workflows and industry challenges.

#### 🎯 Phase 4: Job Hunting & Tailoring your Pitch (Months 9-12)
* **Goal**: Apply to targeted green positions and present a clean value proposition.
* **Strategy**:
  - Tailor your resume to highlight the *carbon reduction impact* or efficiency savings of your previous roles.
  - Search jobs on specialist boards: Climatebase, GreenBiz Jobs, and Ed\'s Clean Energy Jobs.
  - Prepare for interviews by researching the target company's current ESG targets and explaining how you can help achieve them.
* **Action Item**: Submit targeted applications to 10-15 firms with custom cover letters referencing their specific sustainability initiatives.`;

    return {
      career: matchedCareer,
      matchingExplanation: explanation,
      roadmap
    };
  };

  // Sync / Load Logic
  const refreshAllData = async () => {
    setLoading(true);
    try {
      const healthRes = await fetch(`${API_BASE.replace('/api', '')}/health`);
      if (!healthRes.ok) throw new Error('Backend Offline');

      const [fRes, gRes, lRes, aRes, sRes, cRes] = await Promise.all([
        fetch(`${API_BASE}/footprints`),
        fetch(`${API_BASE}/goals`),
        fetch(`${API_BASE}/logs`),
        fetch(`${API_BASE}/actions`),
        fetch(`${API_BASE}/logs/streaks`),
        fetch(`${API_BASE}/careers`)
      ]);

      const fData = await fRes.json();
      const gData = await gRes.json();
      const lData = await lRes.json();
      const aData = await aRes.json();
      const sData = await sRes.json();
      const cData = await cRes.json();

      setFootprints(fData);
      setGoals(gData);
      setLogs(lData);
      setActions(aData);
      setStreaks(sData);
      setCareers(cData);
      setIsUsingFallback(false);
    } catch (err) {
      console.warn('Backend server is offline. Falling back to local LocalStorage mode.');
      setIsUsingFallback(true);
      
      const localFootprints = JSON.parse(localStorage.getItem('eco_footprints') || '[]');
      const localGoals = JSON.parse(localStorage.getItem('eco_goals') || '[]');
      const localLogs = JSON.parse(localStorage.getItem('eco_logs') || '[]');
      const localActions = JSON.parse(localStorage.getItem('eco_actions') || '[]');
      const localRec = JSON.parse(localStorage.getItem('eco_recommendation') || 'null');
      
      setFootprints(localFootprints);
      setGoals(localGoals);
      setLogs(localLogs);
      setRecommendedCareer(localRec);
      setCareers(CURATED_CAREERS);
      
      const actionsToSet = localActions.length > 0 ? localActions : DEFAULT_ACTIONS;
      setActions(actionsToSet);
      
      const localStreakStats = calculateLocalStreaks(localLogs);
      setStreaks(localStreakStats);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    refreshAllData();
  }, []);

  const calculateCarbon = async (inputs: CarbonInputs): Promise<FootprintRecord> => {
    try {
      if (isUsingFallback) throw new Error('Local Mode active');

      const res = await fetch(`${API_BASE}/footprints`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(inputs)
      });

      if (!res.ok) throw new Error('API Error');
      const data = await res.json();
      
      setFootprints(prev => [...prev, data]);
      return data;
    } catch (err) {
      const calculated = calculateLocalEmissions(inputs);
      const record: FootprintRecord = {
        id: Math.random().toString(36).substring(2, 11),
        date: new Date().toISOString(),
        ...calculated
      };
      
      const updated = [...footprints, record];
      setFootprints(updated);
      localStorage.setItem('eco_footprints', JSON.stringify(updated));
      return record;
    }
  };

  const createGoal = async (goalInputs: Omit<Goal, 'id' | 'currentValue' | 'completed' | 'createdAt'>): Promise<Goal> => {
    try {
      if (isUsingFallback) throw new Error('Local Mode active');

      const res = await fetch(`${API_BASE}/goals`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(goalInputs)
      });

      if (!res.ok) throw new Error('API Error');
      const data = await res.json();
      setGoals(prev => [...prev, data]);
      return data;
    } catch (err) {
      let baseline = 0;
      if (footprints.length > 0) {
        const latest = footprints[footprints.length - 1];
        if (goalInputs.category === 'total') baseline = latest.total;
        else if (goalInputs.category === 'transport') baseline = latest.transport;
        else if (goalInputs.category === 'energy') baseline = latest.energy;
        else if (goalInputs.category === 'water') baseline = latest.water;
        else if (goalInputs.category === 'food') baseline = latest.food;
        else if (goalInputs.category === 'waste') baseline = latest.waste;
      }

      const goal: Goal = {
        id: Math.random().toString(36).substring(2, 11),
        category: goalInputs.category,
        targetValue: goalInputs.targetValue,
        targetDate: goalInputs.targetDate,
        currentValue: baseline,
        completed: false,
        createdAt: new Date().toISOString()
      };

      const updated = [...goals, goal];
      setGoals(updated);
      localStorage.setItem('eco_goals', JSON.stringify(updated));
      return goal;
    }
  };

  const updateGoalProgress = async (id: string, value: number, completed: boolean) => {
    try {
      if (isUsingFallback) throw new Error('Local Mode active');

      const res = await fetch(`${API_BASE}/goals/${id}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ currentValue: value, completed })
      });
      if (!res.ok) throw new Error('API Error');
      const data = await res.json();

      setGoals(prev => prev.map(g => g.id === id ? data : g));
    } catch (err) {
      const updated = goals.map(g => g.id === id ? { ...g, currentValue: value, completed } : g);
      setGoals(updated);
      localStorage.setItem('eco_goals', JSON.stringify(updated));
    }
  };

  const toggleActionItem = async (id: string, completed: boolean) => {
    try {
      if (isUsingFallback) throw new Error('Local Mode active');

      const res = await fetch(`${API_BASE}/actions/${id}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ completed })
      });
      if (!res.ok) throw new Error('API Error');
      const data = await res.json();

      setActions(prev => prev.map(a => a.id === id ? data : a));
    } catch (err) {
      const updated = actions.map(a => a.id === id ? { ...a, completed } : a);
      setActions(updated);
      localStorage.setItem('eco_actions', JSON.stringify(updated));
    }
  };

  const logDailyHabit = async (logInputs: Omit<DailyLog, 'id' | 'co2Saved'>): Promise<DailyLog> => {
    try {
      if (isUsingFallback) throw new Error('Local Mode active');

      const res = await fetch(`${API_BASE}/logs`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(logInputs)
      });
      if (!res.ok) throw new Error('API Error');
      const data = await res.json();

      setLogs(prev => {
        const filtered = prev.filter(l => l.date !== data.date);
        return [...filtered, data];
      });

      const sRes = await fetch(`${API_BASE}/logs/streaks`);
      const sData = await sRes.json();
      setStreaks(sRes.ok ? sData : streaks);

      return data;
    } catch (err) {
      let baseline = 15;
      if (footprints.length > 0) {
        baseline = footprints[footprints.length - 1].total / 365;
      }

      const todayTransport = logInputs.transportDistance * 0.35 + logInputs.publicTransitTime * 0.8;
      const todayFood = logInputs.isVegetarian ? 4.6 : 8.2;
      const todayWaste = logInputs.wasteRecycled ? 0.5 : 1.2;
      const todayWater = 0.5 - (logInputs.waterSaved * 0.0035);
      const totalToday = todayTransport + todayFood + todayWaste + todayWater;
      const co2Saved = Math.max(0, baseline - totalToday);

      const log: DailyLog = {
        id: Math.random().toString(36).substring(2, 11),
        date: logInputs.date,
        transportDistance: logInputs.transportDistance,
        publicTransitTime: logInputs.publicTransitTime,
        isVegetarian: logInputs.isVegetarian,
        waterSaved: logInputs.waterSaved,
        wasteRecycled: logInputs.wasteRecycled,
        co2Saved: Number(co2Saved.toFixed(2))
      };

      setLogs(prev => {
        const filtered = prev.filter(l => l.date !== log.date);
        const updated = [...filtered, log];
        localStorage.setItem('eco_logs', JSON.stringify(updated));
        
        const localStreakStats = calculateLocalStreaks(updated);
        setStreaks(localStreakStats);

        return updated;
      });

      return log;
    }
  };

  const getCoachReport = async () => {
    setCoachLoading(true);
    try {
      if (isUsingFallback) throw new Error('Local Mode active');

      const res = await fetch(`${API_BASE}/coach/analyze`);
      if (!res.ok) throw new Error('API Error');
      const data = await res.json();
      setCoachAnalysis(data);
    } catch (err) {
      if (footprints.length > 0) {
        const latest = footprints[footprints.length - 1];
        setCoachAnalysis(getLocalCoachAnalysis(latest));
      } else {
        setCoachAnalysis({
          analysis: '### 🌿 Welcome to EcoTrack AI Coach!\n\nPlease complete your first Carbon Footprint calculation using the Calculator tab to receive personalized coaching insights and actionable advice.',
          recommendations: ['Calculate your baseline carbon footprint.'],
          topSource: 'None'
        });
      }
    } finally {
      setCoachLoading(false);
    }
  };

  const recommendCareerPath = async (skills: string, interest: string): Promise<CareerRecommendation> => {
    setRecommendationLoading(true);
    try {
      if (isUsingFallback) throw new Error('Local Mode active');

      const res = await fetch(`${API_BASE}/careers/recommend`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ skills, interest })
      });

      if (!res.ok) throw new Error('API Error');
      const data = await res.json();
      setRecommendedCareer(data);
      return data;
    } catch (err) {
      const recommendation = recommendLocalCareer(skills, interest);
      setRecommendedCareer(recommendation);
      localStorage.setItem('eco_recommendation', JSON.stringify(recommendation));
      return recommendation;
    } finally {
      setRecommendationLoading(false);
    }
  };

  return (
    <AppContext.Provider value={{
      footprints,
      goals,
      logs,
      actions,
      streaks,
      careers,
      recommendedCareer,
      recommendationLoading,
      loading,
      coachAnalysis,
      coachLoading,
      activeTab,
      setActiveTab,
      calculateCarbon,
      createGoal,
      updateGoalProgress,
      toggleActionItem,
      logDailyHabit,
      getCoachReport,
      recommendCareerPath,
      refreshAllData,
      isUsingFallback
    }}>
      {children}
    </AppContext.Provider>
  );
};

export const useApp = () => {
  const context = useContext(AppContext);
  if (context === undefined) {
    throw new Error('useApp must be used within an AppProvider');
  }
  return context;
};
