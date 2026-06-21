import { GoogleGenerativeAI } from '@google/generative-ai';

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

export const CURATED_CAREERS: GreenCareer[] = [
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

export class CareerService {
  private genAI: GoogleGenerativeAI | null = null;

  constructor() {
    const apiKey = process.env.GEMINI_API_KEY;
    if (apiKey) {
      try {
        this.genAI = new GoogleGenerativeAI(apiKey);
      } catch (e) {
        console.error('Failed to initialize Gemini for CareerService:', e);
      }
    }
  }

  public async getRecommendation(userSkills: string, interest: string): Promise<CareerRecommendation> {
    const skillsLower = userSkills.toLowerCase();
    
    // Core logic matching to our curated list
    let matchedCareer = CURATED_CAREERS[0]; // Default: Climate AI Engineer

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

    let explanation = `Based on your skills in **"${userSkills}"** and interest in **"${interest.replace('-', ' ')}"**, we recommend the path of a **${matchedCareer.title}**. `;
    let roadmap = '';

    // Connect to Gemini if API key is active
    if (this.genAI) {
      try {
        const model = this.genAI.getGenerativeModel({ model: 'gemini-1.5-flash' });
        const prompt = `
You are an expert AI Career Coach specializing in Sustainability and Green Technology.
The user wants to transition into a career as a: **${matchedCareer.title}**.
Their current skills are: **"${userSkills}"**.
Their specific sustainability interest area is: **"${interest}"**.

Please perform two tasks:
1. Write a custom explanation (around 80 words) of why their current skills are highly transferable and how they map to this career.
2. Generate a step-by-step career transition roadmap in clean Markdown. The roadmap should contain 4 phases:
   - Phase 1: Bridging the Gap (First 1-3 Months) - specific courses, topics, or skills to acquire.
   - Phase 2: building a Green Portfolio (Months 3-6) - practical project ideas combining their skills with sustainability.
   - Phase 3: Networking & Gaining Domain Authority (Months 6-9) - communities, conferences, or open-source.
   - Phase 4: Job Hunting Strategy (Months 9-12) - targeting organizations, tailoring resume.

Return the response in JSON format with exactly these two keys:
{
  "explanation": "YOUR_EXPLANATION_HERE",
  "roadmap": "YOUR_ROADMAP_MARKDOWN_HERE"
}
Ensure the JSON is fully valid. Do not wrap the JSON output in markdown backticks.
`;

        const result = await model.generateContent({
          contents: [{ role: 'user', parts: [{ text: prompt }] }],
          generationConfig: {
            responseMimeType: 'application/json'
          }
        });

        const text = result.response.text();
        const parsed = JSON.parse(text);
        if (parsed.explanation && parsed.roadmap) {
          return {
            career: matchedCareer,
            matchingExplanation: parsed.explanation,
            roadmap: parsed.roadmap
          };
        }
      } catch (err) {
        console.error('Gemini API failed in CareerService, using local generator:', err);
      }
    }

    // Heuristic Fallback Roadmap Generator
    explanation += `Your background gives you a strong foundation to build on. Transitioning to this role will allow you to reduce CO2 emissions by up to **${matchedCareer.co2ReductionPotential} tons** annually through systemic industrial and structural shifts.`;
    roadmap = this.generateLocalRoadmap(matchedCareer, userSkills);

    return {
      career: matchedCareer,
      matchingExplanation: explanation,
      roadmap
    };
  }

  private generateLocalRoadmap(career: GreenCareer, currentSkills: string): string {
    return `### 🗺️ Career Transition Roadmap: ${career.title}

Here is a structured transition path prepared by EcoCoach AI to leverage your existing skillset (**${currentSkills}**) and prepare you for a professional green impact role.

#### 📈 Phase 1: Core Fundamentals & Bridging the Gap (Months 1-3)
* **Goal**: Acquire foundational knowledge in sustainability frameworks and specialized technical protocols.
* **Topics to learn**:
  ${career.category === 'tech-ai' || career.category === 'data-science' 
    ? `- Master green coding principles and energy-efficient algorithm structures.\n- Complete foundational courses on climate science data patterns.` 
    : ''}
  ${career.category === 'renewable-energy' 
    ? `- Study smart grid integration concepts, AC/DC load factors, and battery chemistries.\n- Complete training on PV design software (e.g. PVsyst or CAD).` 
    : ''}
  ${career.category === 'circular-economy' 
    ? `- Learn Life Cycle Assessment (LCA) software (e.g., SimaPro, openLCA).\n- Read Cradle-to-Cradle engineering principles.` 
    : ''}
  ${career.category === 'policy-consulting' 
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
  }
}
