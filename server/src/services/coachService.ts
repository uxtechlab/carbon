import { GoogleGenerativeAI } from '@google/generative-ai';
import { FootprintRecord } from '../models/db';

export interface CoachAnalysis {
  analysis: string; // Markdown formatted report
  recommendations: string[]; // List of specific recommendations
  topSource: string;
}

export class CoachService {
  private genAI: GoogleGenerativeAI | null = null;

  constructor() {
    const apiKey = process.env.GEMINI_API_KEY;
    if (apiKey) {
      try {
        this.genAI = new GoogleGenerativeAI(apiKey);
      } catch (e) {
        console.error('Failed to initialize Gemini API Client:', e);
      }
    }
  }

  public async analyzeFootprint(record: FootprintRecord): Promise<CoachAnalysis> {
    const { transport, energy, water, food, waste, total, score, inputs } = record;

    // Identify top source
    const categories = [
      { name: 'Transportation', value: transport },
      { name: 'Home Energy', value: energy },
      { name: 'Water Consumption', value: water },
      { name: 'Diet & Food Habits', value: food },
      { name: 'Waste & Consumption', value: waste }
    ];
    categories.sort((a, b) => b.value - a.value);
    const topSource = categories[0].name;

    if (this.genAI) {
      try {
        const model = this.genAI.getGenerativeModel({ model: 'gemini-1.5-flash' });
        const prompt = `
You are an expert AI Sustainability Coach named "EcoCoach AI".
Analyze the following user carbon footprint data (all values in kg CO2e per year, except where noted):

- Total Footprint: ${total.toFixed(0)} kg CO2e / year
- Sustainability Score: ${score.toFixed(0)} / 100
- Transportation: ${transport.toFixed(0)} kg CO2e (Inputs: ${inputs.carMileage} miles driven/year with a ${inputs.fuelType} car, ${inputs.publicTransitHours} hours/week of public transit, ${inputs.flightsPerYear} flights/year)
- Home Energy: ${energy.toFixed(0)} kg CO2e (Inputs: ${inputs.electricityKwh} kWh/month, heating source: ${inputs.heatingSource}, household size: ${inputs.householdSize})
- Water Consumption: ${water.toFixed(0)} kg CO2e (Inputs: ${inputs.waterGallonsDaily} gallons/day)
- Diet & Food Habits: ${food.toFixed(0)} kg CO2e (Inputs: ${inputs.dietType} diet)
- Waste & Consumption: ${waste.toFixed(0)} kg CO2e (Inputs: ${inputs.wasteBagsWeekly} trash bags/week, recycling ${inputs.recyclingPercent}%)

Please write a highly personalized, encouraging, and clear markdown report (around 300 words).
The report MUST contain:
1. An introductory assessment of their current carbon footprint and sustainability score (compared to the global average of ~4,500 kg/person or typical western average of ~15,000 kg/person).
2. A detailed breakdown of their primary emission driver (which is ${topSource}) explaining WHY it is so high based on their inputs.
3. 3-4 specific, highly realistic lifestyle changes they can make immediately to reduce their footprint.
4. A concluding word of encouragement.

Also, return the response as a JSON structure with exactly these keys:
{
  "analysis": "YOUR_MARKDOWN_REPORT_HERE",
  "recommendations": ["Recommendation 1", "Recommendation 2", "Recommendation 3", "Recommendation 4"]
}
Ensure the JSON is valid. If there is formatting issue, do not surround it with markdown backticks inside the JSON value.
`;

        const result = await model.generateContent({
          contents: [{ role: 'user', parts: [{ text: prompt }] }],
          generationConfig: {
            responseMimeType: 'application/json'
          }
        });

        const text = result.response.text();
        const parsed = JSON.parse(text);
        if (parsed.analysis && Array.isArray(parsed.recommendations)) {
          return {
            analysis: parsed.analysis,
            recommendations: parsed.recommendations,
            topSource
          };
        }
      } catch (err) {
        console.error('Gemini API execution failed, falling back to heuristic engine:', err);
      }
    }

    // Heuristic Fallback Engine
    return this.generateHeuristicAnalysis(record, topSource);
  }

  private generateHeuristicAnalysis(record: FootprintRecord, topSource: string): CoachAnalysis {
    const { transport, energy, water, food, waste, total, score, inputs } = record;
    const recommendations: string[] = [];

    // Formulate Heuristic Report
    let report = `### 🌿 EcoCoach AI Analysis Report

Hi there! I have analyzed your carbon footprint calculation of **${(total / 1000).toFixed(1)} metric tons (CO2e) per year**. Your **Sustainability Score is ${score.toFixed(0)}/100**. 

For context, the typical average footprint in a high-income nation is about **14.0 tons**, whereas the global average is around **4.7 tons**. To prevent the worst impacts of climate change, the Paris Agreement targets a reduction to under **2.0 tons per person** by 2050.

Your largest emission driver is **${topSource}**, contributing **${((categoriesValueMap(topSource, record) / total) * 100).toFixed(0)}%** of your total environmental impact.

`;

    // Category specific analysis
    if (topSource === 'Transportation') {
      report += `#### 🚗 Transportation Breakdown
Your transport footprint is **${(transport / 1000).toFixed(1)} tons CO2e/year**. This is primarily driven by driving **${inputs.carMileage.toLocaleString()} miles** annually in a **${inputs.fuelType}** vehicle. 
`;
      if (inputs.fuelType === 'petrol' || inputs.fuelType === 'diesel') {
        report += `Your internal combustion engine releases significant greenhouse gases. `;
        recommendations.push(`Consider swapping 15% of your single-occupancy driving with biking, walking, or public transit.`);
        recommendations.push(`Switch to a hybrid or electric vehicle (EV) next time you purchase a car to reduce fuel emissions by up to 70%.`);
      } else if (inputs.fuelType === 'electric') {
        report += `Although your EV is highly efficient, ensure you charge it using renewable energy where possible to eliminate grid emissions. `;
      }

      if (inputs.flightsPerYear > 2) {
        report += `Additionally, taking **${inputs.flightsPerYear} flights** per year represents a large spike in high-altitude radiative forcing. `;
        recommendations.push(`Reduce non-essential flights. For domestic travel, prefer high-speed rail, or bundle business trips into video conferences.`);
      } else {
        recommendations.push(`Keep tires inflated and maintain an even speed on the highway to boost fuel efficiency by 3-5%.`);
      }
    } else if (topSource === 'Home Energy') {
      report += `#### ⚡ Home Energy Breakdown
Your household energy footprint is **${(energy / 1000).toFixed(1)} tons CO2e/year**, with an electricity usage of **${inputs.electricityKwh} kWh/month** shared among **${inputs.householdSize}** residents. 
`;
      if (inputs.heatingSource === 'oil' || inputs.heatingSource === 'gas') {
        report += `Using **${inputs.heatingSource}** for heating creates direct fossil fuel combustion emissions in your home. `;
        recommendations.push(`Switch your heating system to an electric heat pump, which is 3x to 4x more energy-efficient than gas or oil.`);
      }
      recommendations.push(`Wash your laundry in cold water (30°C or below) to save up to 90% of the energy consumed by the washing machine.`);
      recommendations.push(`Install a smart thermostat to lower heating/cooling by 10% during sleep or while away.`);
    } else if (topSource === 'Diet & Food Habits') {
      report += `#### 🍔 Diet & Food Habits Breakdown
Your dietary emissions stand at **${(food / 1000).toFixed(1)} tons CO2e/year**. 
`;
      if (inputs.dietType === 'heavy-meat') {
        report += `Consuming red meat daily is carbon-intensive due to enteric fermentation (methane) and feed production land-use requirements. `;
        recommendations.push(`Adopt a "Meatless Mondays" habit or swap red meats (beef, lamb) for low-emission proteins like poultry, fish, or legumes.`);
      } else if (inputs.dietType === 'average-meat') {
        report += `Your moderate meat consumption still represents a major opportunity. `;
        recommendations.push(`Increase your plant-based meals to 4-5 days a week to lower food emissions by up to 35%.`);
      } else if (inputs.dietType === 'vegetarian') {
        report += `As a vegetarian, you have a solid low-carbon footprint, though dairy production (cheese, milk) still contributes emissions. `;
        recommendations.push(`Try incorporating more plant-based milks and cheeses into your meals.`);
      }
      recommendations.push(`Reduce food waste by planning meals ahead and composting leftovers. Food waste in landfills produces highly potent methane gas.`);
    } else if (topSource === 'Water Consumption') {
      report += `#### 💧 Water Consumption Breakdown
Your direct water usage of **${inputs.waterGallonsDaily} gallons/day** accounts for **${(water / 1000).toFixed(1)} tons CO2e/year** in treatment, delivery, and water heating energy.
`;
      recommendations.push(`Install low-flow showerheads and aerators on faucets to cut water use by up to 30% without losing pressure.`);
      recommendations.push(`Fix leaking faucets immediately. A single leaking faucet can waste up to 3,000 gallons of water per year.`);
      recommendations.push(`Only run washing machines and dishwashers when they are fully loaded.`);
    } else {
      report += `#### 🗑️ Waste & Consumption Breakdown
Your waste and shopping footprint is **${(waste / 1000).toFixed(1)} tons CO2e/year**. You currently recycle **${inputs.recyclingPercent}%** of your waste.
`;
      if (inputs.recyclingPercent < 50) {
        report += `Low recycling rates mean more waste goes to landfills, causing methane release and requiring more virgin materials. `;
        recommendations.push(`Improve your sorting habits to recycle more paper, cardboard, plastics, metals, and glass.`);
      }
      recommendations.push(`Practice minimalist shopping: ask yourself if you really need a new item, or if you can buy it second-hand or repair what you have.`);
      recommendations.push(`Avoid single-use plastics entirely by keeping reusable shopping bags, water bottles, and coffee cups in your bag or car.`);
    }

    // Default fallbacks if recommendations array is too short
    if (recommendations.length < 3) {
      recommendations.push(`Switch standard light bulbs to LEDs to save energy.`);
      recommendations.push(`Unplug electronics when not in use to eliminate phantom power draw.`);
    }

    report += `
#### 🚀 Next Steps
I have populated your **Action Items** checklist with specific recommendations. Toggle them to see your potential footprint reductions in real-time. By implementing just two or three of these recommendations, you can reduce your emissions substantially! 

Every small step matters. Keep tracking, keep reducing, and let's work together to create a sustainable future! 🌍`;

    return {
      analysis: report,
      recommendations,
      topSource
    };
  }
}

function categoriesValueMap(category: string, record: FootprintRecord): number {
  switch (category) {
    case 'Transportation': return record.transport;
    case 'Home Energy': return record.energy;
    case 'Water Consumption': return record.water;
    case 'Diet & Food Habits': return record.food;
    case 'Waste & Consumption': return record.waste;
    default: return 0;
  }
}
