import React, { useState } from 'react';
import { useApp } from '../context/AppContext';
import { CheckSquare, Square, Zap, Car, Utensils, Trash2, Droplet, Trees, Flame } from 'lucide-react';

export const ActionItems: React.FC = () => {
  const { actions, toggleActionItem } = useApp();
  const [filter, setFilter] = useState<'all' | 'energy' | 'transport' | 'food' | 'water' | 'waste'>('all');

  // Compute total carbon saved
  const completedActions = actions.filter(a => a.completed);
  const totalCo2Saved = completedActions.reduce((sum, current) => sum + current.co2Reduction, 0);
  const equivalentTrees = Math.round(totalCo2Saved / 22);

  const getCategoryIcon = (category: string) => {
    switch (category) {
      case 'energy': return <Zap className="text-eco-green h-5 w-5" />;
      case 'transport': return <Car className="text-eco-blue h-5 w-5" />;
      case 'food': return <Utensils className="text-eco-amber h-5 w-5" />;
      case 'water': return <Droplet className="text-eco-indigo h-5 w-5" />;
      case 'waste': return <Trash2 className="text-eco-red h-5 w-5" />;
      default: return null;
    }
  };

  const getCategoryColor = (category: string) => {
    switch (category) {
      case 'energy': return 'border-eco-green/30 bg-eco-green/5';
      case 'transport': return 'border-eco-blue/30 bg-eco-blue/5';
      case 'food': return 'border-eco-amber/30 bg-eco-amber/5';
      case 'water': return 'border-eco-indigo/30 bg-eco-indigo/5';
      case 'waste': return 'border-eco-red/30 bg-eco-red/5';
      default: return 'border-dark-border/40';
    }
  };

  const filteredActions = filter === 'all' 
    ? actions 
    : actions.filter(a => a.category === filter);

  return (
    <div className="space-y-8 animate-fade-in">
      {/* Header */}
      <div>
        <h1 className="text-3xl font-display font-bold text-white flex items-center gap-2">
          <CheckSquare className="text-eco-green" /> Action Recommendations
        </h1>
        <p className="text-dark-muted mt-1">Commit to small daily changes and see your potential annual CO2 reductions.</p>
      </div>

      {/* Stats Board */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <div className="glass-panel p-6 flex items-center gap-4 border-eco-green/30">
          <div className="p-4 bg-eco-green/10 text-eco-green rounded-2xl">
            <Flame className="h-8 w-8" />
          </div>
          <div>
            <span className="text-xs text-dark-muted font-semibold block">Total Annual Carbon Saved</span>
            <span className="text-3xl font-display font-extrabold text-white">{totalCo2Saved.toLocaleString()} kg CO2e</span>
            <span className="text-xs text-dark-muted block mt-1">By committing to active recommendations</span>
          </div>
        </div>

        <div className="glass-panel p-6 flex items-center gap-4 border-eco-indigo/30">
          <div className="p-4 bg-eco-indigo/10 text-eco-indigo rounded-2xl">
            <Trees className="h-8 w-8" />
          </div>
          <div>
            <span className="text-xs text-dark-muted font-semibold block">Equivalent Trees Planted</span>
            <span className="text-3xl font-display font-extrabold text-white">{equivalentTrees} trees / year</span>
            <span className="text-xs text-dark-muted block mt-1">Carbon offset equivalence</span>
          </div>
        </div>
      </div>

      {/* Filters */}
      <div className="flex flex-wrap gap-2">
        {(['all', 'energy', 'transport', 'food', 'water', 'waste'] as const).map(cat => (
          <button
            key={cat}
            onClick={() => setFilter(cat)}
            className={`px-4 py-2 text-xs font-semibold capitalize rounded-lg transition duration-200 border ${
              filter === cat 
                ? 'bg-eco-green border-eco-green text-black font-extrabold' 
                : 'bg-dark-card border-dark-border text-dark-text/90 hover:bg-dark-hover'
            }`}
          >
            {cat}
          </button>
        ))}
      </div>

      {/* Actions Checklist */}
      <div className="space-y-4">
        {filteredActions.length === 0 ? (
          <div className="glass-panel p-8 text-center text-dark-muted">
            No active action recommendations for this category.
          </div>
        ) : (
          filteredActions.map(action => (
            <div 
              key={action.id} 
              onClick={() => toggleActionItem(action.id, !action.completed)}
              className={`glass-panel p-5 flex items-start gap-4 border cursor-pointer transition-all duration-200 ${
                action.completed 
                  ? 'border-eco-green/45 bg-eco-green/5 shadow-glow' 
                  : 'border-dark-border/40 hover:border-dark-muted/30 bg-dark-card/50'
              }`}
            >
              {/* Checkbox Icon */}
              <div className="flex-shrink-0 mt-0.5 text-2xl transition duration-150">
                {action.completed ? (
                  <CheckSquare className="text-eco-green h-5 w-5" />
                ) : (
                  <Square className="text-dark-muted h-5 w-5" />
                )}
              </div>

              {/* Category Icon */}
              <div className={`p-2.5 rounded-xl border flex-shrink-0 ${getCategoryColor(action.category)}`}>
                {getCategoryIcon(action.category)}
              </div>

              {/* Title & Desc */}
              <div className="flex-1 min-w-0">
                <div className="flex flex-col md:flex-row md:items-center justify-between gap-1">
                  <h3 className={`text-md font-bold transition ${action.completed ? 'text-eco-green line-through' : 'text-white'}`}>
                    {action.title}
                  </h3>
                  <span className="text-xs px-2.5 py-0.5 bg-dark-bg/60 border border-dark-border/45 text-eco-green font-bold rounded-full w-fit">
                    -{action.co2Reduction} kg CO2e/yr
                  </span>
                </div>
                <p className="text-xs text-dark-muted mt-1 leading-relaxed">{action.description}</p>
              </div>
            </div>
          ))
        )}
      </div>
    </div>
  );
};
