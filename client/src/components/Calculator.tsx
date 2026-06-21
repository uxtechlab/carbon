import React, { useState } from 'react';
import { useApp } from '../context/AppContext';
import type { CarbonInputs } from '../context/AppContext';
import { Car, Zap, Utensils, Trash2, ArrowLeft, ArrowRight, CheckCircle2 } from 'lucide-react';

const STEPS = [
  { id: 'transport', name: 'Transportation', icon: Car },
  { id: 'energy', name: 'Home Energy', icon: Zap },
  { id: 'diet', name: 'Diet & Water', icon: Utensils },
  { id: 'waste', name: 'Waste & Products', icon: Trash2 }
];

export const Calculator: React.FC = () => {
  const { calculateCarbon, setActiveTab, getCoachReport } = useApp();
  const [currentStep, setCurrentStep] = useState(0);
  const [submitting, setSubmitting] = useState(false);

  const [inputs, setInputs] = useState<CarbonInputs>({
    carMileage: 6000,
    fuelType: 'petrol',
    publicTransitHours: 3,
    flightsPerYear: 1,
    electricityKwh: 350,
    heatingSource: 'gas',
    householdSize: 2,
    waterGallonsDaily: 80,
    dietType: 'average-meat',
    wasteBagsWeekly: 3,
    recyclingPercent: 30
  });

  const handleInputChange = (name: keyof CarbonInputs, value: any) => {
    setInputs(prev => ({
      ...prev,
      [name]: value
    }));
  };

  const handleNext = () => {
    if (currentStep < STEPS.length - 1) {
      setCurrentStep(currentStep + 1);
    }
  };

  const handlePrev = () => {
    if (currentStep > 0) {
      setCurrentStep(currentStep - 1);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setSubmitting(true);
    try {
      await calculateCarbon(inputs);
      // Wait a moment for UX
      setTimeout(async () => {
        await getCoachReport();
        setSubmitting(false);
        setActiveTab('dashboard');
      }, 1000);
    } catch (err) {
      console.error(err);
      setSubmitting(false);
    }
  };

  const activeStepId = STEPS[currentStep].id;

  return (
    <div className="max-w-3xl mx-auto space-y-8 animate-fade-in">
      {/* Title */}
      <div>
        <h1 className="text-3xl font-display font-bold text-white">Carbon Footprint Calculator</h1>
        <p className="text-dark-muted mt-1">Provide estimates of your annual and daily habits to compute your carbon impact.</p>
      </div>

      {/* Progress Wizard */}
      <div className="glass-panel p-4 flex justify-between items-center relative overflow-hidden">
        {/* Progress Line */}
        <div className="absolute top-1/2 left-[12%] right-[12%] h-[2px] bg-dark-border -translate-y-1/2 z-0 hidden md:block">
          <div 
            className="h-full bg-eco-green transition-all duration-300"
            style={{ width: `${(currentStep / (STEPS.length - 1)) * 100}%` }}
          />
        </div>

        {STEPS.map((step, idx) => {
          const Icon = step.icon;
          const isActive = idx === currentStep;
          const isCompleted = idx < currentStep;

          return (
            <div key={step.id} className="flex flex-col items-center z-10 w-1/4 relative">
              <div 
                className={`w-10 h-10 rounded-full flex items-center justify-center transition-all duration-300 border-2 ${
                  isActive 
                    ? 'bg-eco-green border-eco-green text-black scale-110 shadow-glow font-bold' 
                    : isCompleted 
                    ? 'bg-eco-green/10 border-eco-green text-eco-green' 
                    : 'bg-dark-card border-dark-border text-dark-muted'
                }`}
              >
                {isCompleted ? <CheckCircle2 className="h-5 w-5" /> : <Icon className="h-5 w-5" />}
              </div>
              <span className={`text-xs mt-2 font-semibold hidden md:block ${isActive ? 'text-white' : 'text-dark-muted'}`}>
                {step.name}
              </span>
            </div>
          );
        })}
      </div>

      {/* Input Form Panel */}
      <div className="glass-panel p-8">
        <form onSubmit={handleSubmit} className="space-y-6">
          {/* Step 1: Transport */}
          {activeStepId === 'transport' && (
            <div className="space-y-6 animate-fade-in">
              <h3 className="text-xl font-bold text-white flex items-center gap-2">
                <Car className="text-eco-blue" /> Commute & Travel Habit
              </h3>
              <p className="text-sm text-dark-muted">Cars, flying, and transit compose a large portion of personal emissions.</p>
              
              <hr className="border-dark-border/40" />

              {/* Input 1: Car Mileage */}
              <div className="space-y-2">
                <div className="flex justify-between text-sm">
                  <label className="text-white font-semibold">Annual Car Commute Distance</label>
                  <span className="text-eco-blue font-bold">{inputs.carMileage.toLocaleString()} miles/year</span>
                </div>
                <input 
                  type="range" 
                  min="0" 
                  max="35000" 
                  step="500"
                  value={inputs.carMileage}
                  onChange={(e) => handleInputChange('carMileage', Number(e.target.value))}
                  className="w-full"
                />
                <p className="text-xs text-dark-muted">National average is around 11,500 miles.</p>
              </div>

              {/* Input 2: Fuel Type */}
              {inputs.carMileage > 0 && (
                <div className="space-y-2">
                  <label className="text-white text-sm font-semibold block">Vehicle Engine / Fuel Type</label>
                  <select 
                    value={inputs.fuelType}
                    onChange={(e) => handleInputChange('fuelType', e.target.value)}
                    className="w-full p-3 bg-dark-bg border border-dark-border rounded-lg text-white text-sm focus:outline-none focus:border-eco-green transition"
                  >
                    <option value="petrol">Petrol (Standard Gasoline)</option>
                    <option value="diesel">Diesel</option>
                    <option value="hybrid">Hybrid (Gas-Electric)</option>
                    <option value="electric">Electric Vehicle (EV)</option>
                  </select>
                </div>
              )}

              {/* Input 3: Public Transit */}
              <div className="space-y-2">
                <div className="flex justify-between text-sm">
                  <label className="text-white font-semibold">Weekly Public Transit Use</label>
                  <span className="text-eco-blue font-bold">{inputs.publicTransitHours} hours/week</span>
                </div>
                <input 
                  type="range" 
                  min="0" 
                  max="40" 
                  step="1"
                  value={inputs.publicTransitHours}
                  onChange={(e) => handleInputChange('publicTransitHours', Number(e.target.value))}
                  className="w-full"
                />
                <p className="text-xs text-dark-muted">Include buses, trains, and subways.</p>
              </div>

              {/* Input 4: Flights */}
              <div className="space-y-2">
                <div className="flex justify-between text-sm">
                  <label className="text-white font-semibold">Flights Per Year</label>
                  <span className="text-eco-blue font-bold">{inputs.flightsPerYear} flights/year</span>
                </div>
                <input 
                  type="range" 
                  min="0" 
                  max="20" 
                  step="1"
                  value={inputs.flightsPerYear}
                  onChange={(e) => handleInputChange('flightsPerYear', Number(e.target.value))}
                  className="w-full"
                />
                <p className="text-xs text-dark-muted">Includes short domestic and long-haul international flights.</p>
              </div>
            </div>
          )}

          {/* Step 2: Home Energy */}
          {activeStepId === 'energy' && (
            <div className="space-y-6 animate-fade-in">
              <h3 className="text-xl font-bold text-white flex items-center gap-2">
                <Zap className="text-eco-green" /> Home Energy & Utilities
              </h3>
              <p className="text-sm text-dark-muted">Residential electricity draw and heating are significant carbon creators.</p>
              
              <hr className="border-dark-border/40" />

              {/* Input 1: Electricity Kwh */}
              <div className="space-y-2">
                <div className="flex justify-between text-sm">
                  <label className="text-white font-semibold">Monthly Electricity Consumption</label>
                  <span className="text-eco-green font-bold">{inputs.electricityKwh} kWh/month</span>
                </div>
                <input 
                  type="range" 
                  min="0" 
                  max="2000" 
                  step="25"
                  value={inputs.electricityKwh}
                  onChange={(e) => handleInputChange('electricityKwh', Number(e.target.value))}
                  className="w-full"
                />
                <p className="text-xs text-dark-muted">Average household uses around 850 kWh per month.</p>
              </div>

              {/* Input 2: Heating Source */}
              <div className="space-y-2">
                <label className="text-white text-sm font-semibold block">Home Heating Utility</label>
                <select 
                  value={inputs.heatingSource}
                  onChange={(e) => handleInputChange('heatingSource', e.target.value)}
                  className="w-full p-3 bg-dark-bg border border-dark-border rounded-lg text-white text-sm focus:outline-none focus:border-eco-green transition"
                >
                  <option value="gas">Natural Gas</option>
                  <option value="electricity">Electric Heat (Heat Pump or Baseboard)</option>
                  <option value="oil">Heating Oil / Fuel Oil</option>
                  <option value="none">No Heat / Renewable Thermal</option>
                </select>
              </div>

              {/* Input 3: Household size */}
              <div className="space-y-2">
                <div className="flex justify-between text-sm">
                  <label className="text-white font-semibold">Household Size (Occupants)</label>
                  <span className="text-eco-green font-bold">{inputs.householdSize} {inputs.householdSize === 1 ? 'person' : 'people'}</span>
                </div>
                <input 
                  type="range" 
                  min="1" 
                  max="8" 
                  step="1"
                  value={inputs.householdSize}
                  onChange={(e) => handleInputChange('householdSize', Number(e.target.value))}
                  className="w-full"
                />
                <p className="text-xs text-dark-muted">Emissions from electric and heat are divided among occupants.</p>
              </div>
            </div>
          )}

          {/* Step 3: Diet & Water */}
          {activeStepId === 'diet' && (
            <div className="space-y-6 animate-fade-in">
              <h3 className="text-xl font-bold text-white flex items-center gap-2">
                <Utensils className="text-eco-indigo" /> Food & Water Habit
              </h3>
              <p className="text-sm text-dark-muted">Agricultural food chains (especially beef) and hot water treatment impact CO2.</p>
              
              <hr className="border-dark-border/40" />

              {/* Input 1: Diet Type */}
              <div className="space-y-2">
                <label className="text-white text-sm font-semibold block">Primary Diet Habit</label>
                <select 
                  value={inputs.dietType}
                  onChange={(e) => handleInputChange('dietType', e.target.value)}
                  className="w-full p-3 bg-dark-bg border border-dark-border rounded-lg text-white text-sm focus:outline-none focus:border-eco-green transition"
                >
                  <option value="heavy-meat">Heavy Meat Eater (Red meat daily)</option>
                  <option value="average-meat">Average Meat Eater (Mixed poultry/pork/beef)</option>
                  <option value="vegetarian">Vegetarian (No meat, consumes dairy/eggs)</option>
                  <option value="vegan">Vegan (100% Plant-based)</option>
                </select>
                <p className="text-xs text-dark-muted">A vegan diet reduces food emissions by up to 60% compared to a heavy meat diet.</p>
              </div>

              {/* Input 2: Water consumption */}
              <div className="space-y-2">
                <div className="flex justify-between text-sm">
                  <label className="text-white font-semibold">Daily Water Usage (per occupant)</label>
                  <span className="text-eco-indigo font-bold">{inputs.waterGallonsDaily} gallons/day</span>
                </div>
                <input 
                  type="range" 
                  min="10" 
                  max="250" 
                  step="10"
                  value={inputs.waterGallonsDaily}
                  onChange={(e) => handleInputChange('waterGallonsDaily', Number(e.target.value))}
                  className="w-full"
                />
                <p className="text-xs text-dark-muted">Typical US average is 80-100 gallons per person per day.</p>
              </div>
            </div>
          )}

          {/* Step 4: Waste & Products */}
          {activeStepId === 'waste' && (
            <div className="space-y-6 animate-fade-in">
              <h3 className="text-xl font-bold text-white flex items-center gap-2">
                <Trash2 className="text-eco-red" /> Waste & Recycling Habits
              </h3>
              <p className="text-sm text-dark-muted">Unsorted landfill garbage rots and generates methane, a highly potent gas.</p>
              
              <hr className="border-dark-border/40" />

              {/* Input 1: Waste Bags */}
              <div className="space-y-2">
                <div className="flex justify-between text-sm">
                  <label className="text-white font-semibold">Weekly Trash Bags Sent to Landfill</label>
                  <span className="text-eco-red font-bold">{inputs.wasteBagsWeekly} bags/week</span>
                </div>
                <input 
                  type="range" 
                  min="0" 
                  max="12" 
                  step="1"
                  value={inputs.wasteBagsWeekly}
                  onChange={(e) => handleInputChange('wasteBagsWeekly', Number(e.target.value))}
                  className="w-full"
                />
                <p className="text-xs text-dark-muted">Standard large trash bags (approx 13 gallons).</p>
              </div>

              {/* Input 2: Recycling percent */}
              <div className="space-y-2">
                <div className="flex justify-between text-sm">
                  <label className="text-white font-semibold">Recycling Percentage</label>
                  <span className="text-eco-red font-bold">{inputs.recyclingPercent}% recycled</span>
                </div>
                <input 
                  type="range" 
                  min="0" 
                  max="100" 
                  step="5"
                  value={inputs.recyclingPercent}
                  onChange={(e) => handleInputChange('recyclingPercent', Number(e.target.value))}
                  className="w-full"
                />
                <p className="text-xs text-dark-muted">Proportion of paper, plastic, metals, and glass sorted from standard trash.</p>
              </div>
            </div>
          )}

          {/* Navigation Controls */}
          <div className="flex justify-between mt-8 border-t border-dark-border/40 pt-6">
            <button
              type="button"
              disabled={currentStep === 0 || submitting}
              onClick={handlePrev}
              className="px-5 py-2.5 bg-dark-card border border-dark-border hover:bg-dark-hover disabled:opacity-50 text-white rounded-lg flex items-center gap-2 transition duration-200"
            >
              <ArrowLeft className="h-4 w-4" /> Previous
            </button>

            {currentStep < STEPS.length - 1 ? (
              <button
                type="button"
                onClick={handleNext}
                className="px-5 py-2.5 bg-eco-green hover:bg-eco-lightGreen text-black font-semibold rounded-lg flex items-center gap-2 transition duration-200"
              >
                Next <ArrowRight className="h-4 w-4" />
              </button>
            ) : (
              <button
                type="submit"
                disabled={submitting}
                className="px-6 py-2.5 bg-eco-green hover:bg-eco-lightGreen disabled:bg-eco-green/40 disabled:cursor-not-allowed text-black font-extrabold rounded-lg flex items-center gap-2 transition duration-200"
              >
                {submitting ? 'Analyzing Footprint...' : 'Save & Calculate'}
              </button>
            )}
          </div>
        </form>
      </div>
    </div>
  );
};
