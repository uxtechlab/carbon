import React from 'react';
import { useApp } from '../context/AppContext';
import { 
  ResponsiveContainer, PieChart, Pie, Cell, Tooltip, Legend,
  BarChart, Bar, XAxis, YAxis, CartesianGrid, LineChart, Line 
} from 'recharts';
import { Flame, Award, ShieldAlert, Sparkles, TrendingDown, Trees } from 'lucide-react';

export const Dashboard: React.FC = () => {
  const { footprints, streaks, logs } = useApp();

  const latestRecord = footprints.length > 0 ? footprints[footprints.length - 1] : null;

  // 1. Setup Pie Chart Data (Category breakdown)
  const pieData = latestRecord ? [
    { name: 'Transportation', value: latestRecord.transport, color: '#3B82F6' },
    { name: 'Home Energy', value: latestRecord.energy, color: '#10B981' },
    { name: 'Water', value: latestRecord.water, color: '#6366F1' },
    { name: 'Diet & Food', value: latestRecord.food, color: '#F59E0B' },
    { name: 'Waste & Products', value: latestRecord.waste, color: '#EF4444' }
  ] : [];

  // 2. Setup Bar Chart Data (Comparison)
  const comparisonData = latestRecord ? [
    { name: 'You', emissions: latestRecord.total / 1000, fill: '#10B981' },
    { name: 'Global Average', emissions: 4.7, fill: '#6366F1' },
    { name: 'US/EU Average', emissions: 14.5, fill: '#F59E0B' },
    { name: 'Paris Agreement Target', emissions: 2.0, fill: '#3B82F6' }
  ] : [];

  // 3. Setup Line Chart Data (Daily logs trend)
  const sortedLogs = [...logs]
    .sort((a, b) => a.date.localeCompare(b.date))
    .slice(-7); // Last 7 logged days
  
  const lineData = sortedLogs.map(l => ({
    date: new Date(l.date).toLocaleDateString(undefined, { month: 'short', day: 'numeric' }),
    saved: l.co2Saved
  }));

  // Equivalent Trees formula: 1 mature tree absorbs ~22kg of CO2 per year
  const treesNeeded = latestRecord ? Math.ceil(latestRecord.total / 22) : 0;

  // Sustainability score styling
  const getScoreColorClass = (score: number) => {
    if (score >= 80) return 'text-eco-green border-eco-green/45';
    if (score >= 50) return 'text-eco-amber border-eco-amber/45';
    return 'text-eco-red border-eco-red/45';
  };

  return (
    <div className="space-y-8 animate-fade-in">
      {/* Header */}
      <div>
        <h1 className="text-3xl font-display font-bold text-white flex items-center gap-2">
          <Sparkles className="text-eco-green" /> EcoTrack Dashboard
        </h1>
        <p className="text-dark-muted mt-1">Track your ecological metrics and monitor your carbon reduction progress.</p>
      </div>

      {!latestRecord ? (
        <div className="glass-panel p-8 text-center space-y-4">
          <ShieldAlert className="mx-auto text-eco-amber h-12 w-12" />
          <h2 className="text-xl font-bold text-white">No Carbon Calculations Recorded</h2>
          <p className="text-dark-muted max-w-md mx-auto">
            Before we can build your dashboard, please compute your baseline emissions using our carbon calculator.
          </p>
          <button 
            onClick={() => {
              // Trigger tab shift
              const tabBtn = document.querySelector('[data-tab="calculator"]') as HTMLButtonElement;
              if (tabBtn) tabBtn.click();
            }}
            className="px-6 py-2 bg-eco-green hover:bg-eco-lightGreen text-black font-semibold rounded-lg transition duration-200"
          >
            Go to Carbon Calculator
          </button>
        </div>
      ) : (
        <>
          {/* Top Quick Stats Grid */}
          <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
            {/* Stat 1: Sustainability Score */}
            <div className="glass-panel glass-panel-hover p-6 flex flex-col justify-between items-center text-center">
              <span className="text-dark-muted font-semibold text-sm">Sustainability Score</span>
              <div className={`mt-4 w-24 h-24 rounded-full border-4 flex items-center justify-center font-display text-3xl font-extrabold ${getScoreColorClass(latestRecord.score)}`}>
                {latestRecord.score}
              </div>
              <span className="text-xs text-dark-muted mt-4">Calculated out of 100 baseline</span>
            </div>

            {/* Stat 2: Total Footprint */}
            <div className="glass-panel glass-panel-hover p-6 flex flex-col justify-between">
              <div className="flex items-center justify-between text-dark-muted">
                <span className="font-semibold text-sm">Annual Footprint</span>
                <TrendingDown className="text-eco-blue h-5 w-5" />
              </div>
              <div className="mt-4">
                <span className="text-4xl font-extrabold text-white">{(latestRecord.total / 1000).toFixed(2)}</span>
                <span className="text-sm font-semibold text-dark-muted ml-2">tons CO2e</span>
              </div>
              <span className="text-xs text-dark-muted mt-4">Recommended target: under 2.0t</span>
            </div>

            {/* Stat 3: Offsets equivalent */}
            <div className="glass-panel glass-panel-hover p-6 flex flex-col justify-between">
              <div className="flex items-center justify-between text-dark-muted">
                <span className="font-semibold text-sm">Offset Requirement</span>
                <Trees className="text-eco-green h-5 w-5" />
              </div>
              <div className="mt-4">
                <span className="text-4xl font-extrabold text-white">{treesNeeded}</span>
                <span className="text-sm font-semibold text-dark-muted ml-2">trees / year</span>
              </div>
              <span className="text-xs text-dark-muted mt-4">To fully absorb your annual output</span>
            </div>

            {/* Stat 4: Active Streak */}
            <div className="glass-panel glass-panel-hover p-6 flex flex-col justify-between">
              <div className="flex items-center justify-between text-dark-muted">
                <span className="font-semibold text-sm">Daily Habit Streak</span>
                <Flame className="text-eco-amber h-5 w-5" />
              </div>
              <div className="mt-4">
                <span className="text-4xl font-extrabold text-white">{streaks.currentStreak}</span>
                <span className="text-sm font-semibold text-dark-muted ml-2">consecutive days</span>
              </div>
              <span className="text-xs text-dark-muted mt-4">Longest streak: {streaks.longestStreak} days</span>
            </div>
          </div>

          {/* Charts Grid */}
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            {/* Chart 1: Breakdown */}
            <div className="glass-panel p-6 space-y-4">
              <h2 className="text-lg font-bold text-white">Carbon Footprint Distribution</h2>
              <div className="h-64">
                <ResponsiveContainer width="100%" height="100%">
                  <PieChart>
                    <Pie
                      data={pieData}
                      cx="50%"
                      cy="50%"
                      innerRadius={60}
                      outerRadius={80}
                      paddingAngle={5}
                      dataKey="value"
                    >
                      {pieData.map((entry, index) => (
                        <Cell key={`cell-${index}`} fill={entry.color} />
                      ))}
                    </Pie>
                    <Tooltip 
                      contentStyle={{ backgroundColor: '#121826', borderColor: '#1F293D', borderRadius: '8px' }}
                      itemStyle={{ color: '#fff' }}
                      formatter={(value: any) => [`${Number(value).toLocaleString()} kg CO2e/yr`]}
                    />
                    <Legend verticalAlign="bottom" height={36} />
                  </PieChart>
                </ResponsiveContainer>
              </div>
            </div>

            {/* Chart 2: Global Comparisons */}
            <div className="glass-panel p-6 space-y-4">
              <h2 className="text-lg font-bold text-white">How You Compare (Metric Tons)</h2>
              <div className="h-64">
                <ResponsiveContainer width="100%" height="100%">
                  <BarChart data={comparisonData} layout="vertical">
                    <CartesianGrid strokeDasharray="3 3" stroke="#1B273D" horizontal={false} />
                    <XAxis type="number" stroke="#9CA3AF" />
                    <YAxis dataKey="name" type="category" width={110} stroke="#9CA3AF" tick={{ fontSize: 11 }} />
                    <Tooltip
                      contentStyle={{ backgroundColor: '#121826', borderColor: '#1F293D', borderRadius: '8px' }}
                      itemStyle={{ color: '#fff' }}
                      formatter={(value: any) => [`${Number(value).toFixed(2)} tons CO2e`]}
                    />
                    <Bar dataKey="emissions">
                      {comparisonData.map((entry, index) => (
                        <Cell key={`cell-${index}`} fill={entry.fill} />
                      ))}
                    </Bar>
                  </BarChart>
                </ResponsiveContainer>
              </div>
            </div>

            {/* Chart 3: Daily Savings Trend */}
            <div className="glass-panel p-6 space-y-4 lg:col-span-2">
              <h2 className="text-lg font-bold text-white">Daily Carbon Savings Trend (Last 7 Logs)</h2>
              {lineData.length === 0 ? (
                <div className="h-48 flex items-center justify-center text-dark-muted text-sm">
                  Log your habits in the "Daily Habit Log" tab to view your carbon savings graph.
                </div>
              ) : (
                <div className="h-64">
                  <ResponsiveContainer width="100%" height="100%">
                    <LineChart data={lineData}>
                      <CartesianGrid strokeDasharray="3 3" stroke="#1B273D" />
                      <XAxis dataKey="date" stroke="#9CA3AF" />
                      <YAxis stroke="#9CA3AF" label={{ value: 'CO2 Saved (kg)', angle: -90, position: 'insideLeft', fill: '#9CA3AF' }} />
                      <Tooltip
                        contentStyle={{ backgroundColor: '#121826', borderColor: '#1F293D', borderRadius: '8px' }}
                        itemStyle={{ color: '#fff' }}
                        formatter={(value: any) => [`${Number(value).toFixed(2)} kg CO2`]}
                      />
                      <Line type="monotone" dataKey="saved" stroke="#10B981" strokeWidth={3} activeDot={{ r: 8 }} />
                    </LineChart>
                  </ResponsiveContainer>
                </div>
              )}
            </div>
          </div>

          {/* Badges and Accomplishments Rack */}
          <div className="glass-panel p-6 space-y-4">
            <h2 className="text-lg font-bold text-white flex items-center gap-2">
              <Award className="text-eco-amber" /> Eco Accomplishments & Badges
            </h2>
            {streaks.badges.length === 0 ? (
              <p className="text-dark-muted text-sm">No badges unlocked yet. Keep logging daily activities or eat vegetarian to unlock your first ecological accomplishments!</p>
            ) : (
              <div className="grid grid-cols-2 md:grid-cols-5 gap-4">
                {streaks.badges.map(badge => (
                  <div key={badge.id} className="p-4 bg-dark-bg/85 border border-dark-border/40 rounded-xl flex flex-col items-center text-center space-y-2 relative group hover:border-eco-amber/40 transition duration-200">
                    <span className="text-4xl">{badge.icon}</span>
                    <span className="text-white text-sm font-semibold block">{badge.name}</span>
                    {/* Tooltip on hover */}
                    <div className="absolute bottom-full mb-2 bg-dark-card border border-dark-border text-xs text-dark-text p-2 rounded shadow-lg max-w-[180px] w-[180px] opacity-0 group-hover:opacity-100 pointer-events-none transition duration-200 z-10">
                      {badge.description}
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        </>
      )}
    </div>
  );
};
