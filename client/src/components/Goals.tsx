import React, { useState } from 'react';
import { useApp } from '../context/AppContext';
import type { Goal } from '../context/AppContext';
import { Target, PlusCircle, Calendar, CheckSquare, ArrowUpRight } from 'lucide-react';

export const Goals: React.FC = () => {
  const { goals, createGoal, footprints } = useApp();
  const [showAddForm, setShowAddForm] = useState(false);
  const [category, setCategory] = useState<Goal['category']>('total');
  const [targetValue, setTargetValue] = useState(2000); // 2000kg is the sustainable target
  const [targetDate, setTargetDate] = useState('');

  const latestRecord = footprints.length > 0 ? footprints[footprints.length - 1] : null;

  const handleAddGoal = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!targetDate) return;
    
    try {
      await createGoal({
        category,
        targetValue,
        targetDate
      });
      setShowAddForm(false);
      setTargetDate('');
    } catch (err) {
      console.error(err);
    }
  };

  // Pre-fill target recommendation when category changes
  const handleCategoryChange = (cat: Goal['category']) => {
    setCategory(cat);
    if (!latestRecord) return;
    // Suggest a 20% reduction target
    let currentVal = 0;
    if (cat === 'total') currentVal = latestRecord.total;
    else if (cat === 'transport') currentVal = latestRecord.transport;
    else if (cat === 'energy') currentVal = latestRecord.energy;
    else if (cat === 'water') currentVal = latestRecord.water;
    else if (cat === 'food') currentVal = latestRecord.food;
    else if (cat === 'waste') currentVal = latestRecord.waste;
    
    setTargetValue(Math.round(currentVal * 0.8));
  };

  // Helper: Calculate progress percentage
  const getGoalProgress = (goal: Goal) => {
    const baseline = goal.currentValue;
    const target = goal.targetValue;
    
    // Check if the current value is updated based on latest footprint
    let current = baseline;
    if (latestRecord) {
      if (goal.category === 'total') current = latestRecord.total;
      else if (goal.category === 'transport') current = latestRecord.transport;
      else if (goal.category === 'energy') current = latestRecord.energy;
      else if (goal.category === 'water') current = latestRecord.water;
      else if (goal.category === 'food') current = latestRecord.food;
      else if (goal.category === 'waste') current = latestRecord.waste;
    }

    if (baseline === target) return 100;

    // For carbon emissions, progress means REDUCING emissions (moving from baseline down to target)
    if (baseline > target) {
      if (current <= target) return 100;
      if (current >= baseline) return 0;
      // Calculate how close we are to the target from the baseline
      const totalRequired = baseline - target;
      const achieved = baseline - current;
      return Math.min(100, Math.max(0, Math.round((achieved / totalRequired) * 100)));
    } else {
      // For scores or things where we want to INCREASE (e.g. if we set a goal to increase sustainability score)
      if (current >= target) return 100;
      if (current <= baseline) return 0;
      const totalRequired = target - baseline;
      const achieved = current - baseline;
      return Math.min(100, Math.max(0, Math.round((achieved / totalRequired) * 100)));
    }
  };

  // Helper: get days remaining
  const getDaysRemaining = (dateStr: string) => {
    const target = new Date(dateStr);
    const today = new Date();
    const diffTime = target.getTime() - today.getTime();
    const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
    return diffDays > 0 ? `${diffDays} days left` : 'Expired';
  };

  return (
    <div className="space-y-8 animate-fade-in">
      {/* Header */}
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-3xl font-display font-bold text-white flex items-center gap-2">
            <Target className="text-eco-blue" /> Target & Goals Tracker
          </h1>
          <p className="text-dark-muted mt-1">Set annual greenhouse gas reduction objectives and track your progress.</p>
        </div>
        {!showAddForm && (
          <button
            onClick={() => {
              setShowAddForm(true);
              if (latestRecord) handleCategoryChange('total');
            }}
            className="px-4 py-2 bg-eco-blue hover:bg-blue-600 text-white font-semibold rounded-lg flex items-center gap-2 transition duration-200"
          >
            <PlusCircle className="h-4 w-4" /> Create Goal
          </button>
        )}
      </div>

      {/* Add Goal Form */}
      {showAddForm && (
        <div className="glass-panel p-6 animate-fade-in border-eco-blue/30">
          <h3 className="text-lg font-bold text-white mb-4 flex items-center gap-2">
            <PlusCircle className="text-eco-blue h-5 w-5" /> Set Carbon Reduction Goal
          </h3>
          <form onSubmit={handleAddGoal} className="grid grid-cols-1 md:grid-cols-3 gap-6">
            {/* Category */}
            <div className="space-y-2">
              <label className="text-xs font-semibold text-dark-muted">Emissions Category</label>
              <select
                value={category}
                onChange={(e) => handleCategoryChange(e.target.value as Goal['category'])}
                className="w-full p-2.5 bg-dark-bg border border-dark-border rounded-lg text-white text-sm focus:outline-none focus:border-eco-blue transition"
              >
                <option value="total">Total Footprint</option>
                <option value="transport">Transportation</option>
                <option value="energy">Home Energy</option>
                <option value="food">Diet & Food</option>
                <option value="water">Water Consumption</option>
                <option value="waste">Waste & Recycling</option>
              </select>
            </div>

            {/* Target Value */}
            <div className="space-y-2">
              <label className="text-xs font-semibold text-dark-muted">Target Carbon Limit (kg CO2e/year)</label>
              <input
                type="number"
                value={targetValue}
                onChange={(e) => setTargetValue(Number(e.target.value))}
                className="w-full p-2.5 bg-dark-bg border border-dark-border rounded-lg text-white text-sm focus:outline-none focus:border-eco-blue transition"
              />
            </div>

            {/* Target Date */}
            <div className="space-y-2">
              <label className="text-xs font-semibold text-dark-muted">Target Deadline Date</label>
              <input
                type="date"
                value={targetDate}
                onChange={(e) => setTargetDate(e.target.value)}
                required
                className="w-full p-2.5 bg-dark-bg border border-dark-border rounded-lg text-white text-sm focus:outline-none focus:border-eco-blue transition"
              />
            </div>

            {/* Controls */}
            <div className="md:col-span-3 flex justify-end gap-3 mt-2">
              <button
                type="button"
                onClick={() => setShowAddForm(false)}
                className="px-4 py-2 bg-dark-card border border-dark-border hover:bg-dark-hover text-white text-sm rounded-lg transition"
              >
                Cancel
              </button>
              <button
                type="submit"
                className="px-5 py-2 bg-eco-blue hover:bg-blue-600 text-white font-semibold text-sm rounded-lg transition"
              >
                Save Target Goal
              </button>
            </div>
          </form>
        </div>
      )}

      {/* Goal Cards Grid */}
      {goals.length === 0 ? (
        <div className="glass-panel p-8 text-center text-dark-muted space-y-3">
          <Target className="mx-auto text-dark-border h-12 w-12" />
          <h3 className="text-white font-bold text-lg">No Active Goals</h3>
          <p className="max-w-md mx-auto text-sm">
            Setting targets encourages sustainable behavioral shifts. Tap "Create Goal" above to define your first ecological milestones.
          </p>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {goals.map(goal => {
            const progress = getGoalProgress(goal);
            const daysLeft = getDaysRemaining(goal.targetDate);
            
            // Current value calculation helper
            let current = goal.currentValue;
            if (latestRecord) {
              if (goal.category === 'total') current = latestRecord.total;
              else if (goal.category === 'transport') current = latestRecord.transport;
              else if (goal.category === 'energy') current = latestRecord.energy;
              else if (goal.category === 'water') current = latestRecord.water;
              else if (goal.category === 'food') current = latestRecord.food;
              else if (goal.category === 'waste') current = latestRecord.waste;
            }

            return (
              <div key={goal.id} className="glass-panel glass-panel-hover p-6 flex flex-col justify-between space-y-4">
                <div className="flex justify-between items-start">
                  <div>
                    <span className="px-2 py-1 bg-eco-blue/15 text-eco-blue text-[10px] uppercase font-bold rounded-md">
                      {goal.category} Emissions Goal
                    </span>
                    <h3 className="text-lg font-bold text-white mt-2 capitalize flex items-center gap-1.5">
                      Reduce {goal.category}
                    </h3>
                  </div>
                  <span className={`text-xs px-2.5 py-0.5 rounded-full font-semibold ${
                    daysLeft === 'Expired' ? 'bg-eco-red/10 text-eco-red' : 'bg-eco-green/10 text-eco-green'
                  } flex items-center gap-1`}>
                    <Calendar className="h-3 w-3" /> {daysLeft}
                  </span>
                </div>

                {/* Numbers */}
                <div className="grid grid-cols-3 gap-2 py-2 text-center bg-dark-bg/40 rounded-xl border border-dark-border/20">
                  <div>
                    <span className="text-[10px] text-dark-muted block">Baseline</span>
                    <strong className="text-white text-sm">{goal.currentValue.toLocaleString()} kg</strong>
                  </div>
                  <div>
                    <span className="text-[10px] text-dark-muted block">Current</span>
                    <strong className={`text-sm ${current <= goal.targetValue ? 'text-eco-green' : 'text-eco-amber'}`}>
                      {current.toLocaleString()} kg
                    </strong>
                  </div>
                  <div>
                    <span className="text-[10px] text-dark-muted block">Target</span>
                    <strong className="text-eco-blue text-sm">{goal.targetValue.toLocaleString()} kg</strong>
                  </div>
                </div>

                {/* Progress Bar */}
                <div className="space-y-1">
                  <div className="flex justify-between text-xs font-semibold text-dark-muted">
                    <span>Goal Progress</span>
                    <span>{progress}% Achieved</span>
                  </div>
                  <div className="w-full h-2 bg-dark-border rounded-full overflow-hidden">
                    <div 
                      className={`h-full rounded-full transition-all duration-500 ${
                        progress === 100 ? 'bg-eco-green' : 'bg-eco-blue'
                      }`}
                      style={{ width: `${progress}%` }}
                    />
                  </div>
                </div>

                {/* Status Callout */}
                {progress === 100 ? (
                  <div className="p-2.5 bg-eco-green/15 border border-eco-green/30 text-eco-green text-xs rounded-lg font-semibold flex items-center gap-1.5 mt-2">
                    <CheckSquare className="h-4 w-4" /> Goal completed! You have successfully kept emissions below your target limit.
                  </div>
                ) : (
                  <div className="text-[11px] text-dark-muted flex justify-between items-center mt-2">
                    <span>Target Date: {new Date(goal.targetDate).toLocaleDateString()}</span>
                    {current > goal.targetValue && (
                      <span className="text-eco-amber flex items-center gap-0.5">
                        Need to save {(current - goal.targetValue).toLocaleString()} kg <ArrowUpRight className="h-3 w-3" />
                      </span>
                    )}
                  </div>
                )}
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
};
