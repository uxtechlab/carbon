import React, { useState } from 'react';
import { useApp } from '../context/AppContext';
import { Calendar, Award, Flame, LogIn, Check } from 'lucide-react';

export const DailyLogger: React.FC = () => {
  const { logDailyHabit, logs, streaks } = useApp();
  const [date, setDate] = useState(new Date().toISOString().split('T')[0]);
  const [transportDistance, setTransportDistance] = useState(15);
  const [publicTransitTime, setPublicTransitTime] = useState(0.5);
  const [isVegetarian, setIsVegetarian] = useState(false);
  const [waterSaved, setWaterSaved] = useState(10);
  const [wasteRecycled, setWasteRecycled] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [savedAmount, setSavedAmount] = useState<number | null>(null);

  const handleSaveLog = async (e: React.FormEvent) => {
    e.preventDefault();
    setSubmitting(true);
    setSavedAmount(null);
    try {
      const data = await logDailyHabit({
        date,
        transportDistance,
        publicTransitTime,
        isVegetarian,
        waterSaved,
        wasteRecycled
      });
      setSavedAmount(data.co2Saved);
      setTimeout(() => {
        setSavedAmount(null);
      }, 5000);
    } catch (err) {
      console.error(err);
    } finally {
      setSubmitting(false);
    }
  };

  // Sort logs by date descending
  const sortedLogs = [...logs].sort((a, b) => b.date.localeCompare(a.date));

  return (
    <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 animate-fade-in">
      {/* Logger Form */}
      <div className="lg:col-span-2 space-y-6">
        <div className="glass-panel p-8 space-y-4">
          <h2 className="text-xl font-bold text-white flex items-center gap-2">
            <Calendar className="text-eco-green" /> Log Daily Activity
          </h2>
          <p className="text-sm text-dark-muted">Log your commute, diet, and resource-saving habits daily to track carbon reductions.</p>
          
          <hr className="border-dark-border/40" />

          <form onSubmit={handleSaveLog} className="space-y-6">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              {/* Date */}
              <div className="space-y-2">
                <label className="text-xs font-semibold text-dark-muted">Date</label>
                <input 
                  type="date"
                  value={date}
                  onChange={(e) => setDate(e.target.value)}
                  max={new Date().toISOString().split('T')[0]}
                  required
                  className="w-full p-2.5 bg-dark-bg border border-dark-border rounded-lg text-white text-sm focus:outline-none focus:border-eco-green transition"
                />
              </div>

              {/* Single Driving */}
              <div className="space-y-2">
                <div className="flex justify-between text-xs">
                  <label className="font-semibold text-dark-muted">Car Commuting Today</label>
                  <span className="text-eco-green font-bold">{transportDistance} miles</span>
                </div>
                <input 
                  type="range"
                  min="0"
                  max="120"
                  step="5"
                  value={transportDistance}
                  onChange={(e) => setTransportDistance(Number(e.target.value))}
                  className="w-full"
                />
              </div>

              {/* Transit usage */}
              <div className="space-y-2">
                <div className="flex justify-between text-xs">
                  <label className="font-semibold text-dark-muted">Transit Commuting Today</label>
                  <span className="text-eco-green font-bold">{publicTransitTime} hours</span>
                </div>
                <input 
                  type="range"
                  min="0"
                  max="8"
                  step="0.5"
                  value={publicTransitTime}
                  onChange={(e) => setPublicTransitTime(Number(e.target.value))}
                  className="w-full"
                />
              </div>

              {/* Water Saved */}
              <div className="space-y-2">
                <div className="flex justify-between text-xs">
                  <label className="font-semibold text-dark-muted">Water Saved (shorter shower/less tap flow)</label>
                  <span className="text-eco-green font-bold">{waterSaved} gallons</span>
                </div>
                <input 
                  type="range"
                  min="0"
                  max="60"
                  step="5"
                  value={waterSaved}
                  onChange={(e) => setWaterSaved(Number(e.target.value))}
                  className="w-full"
                />
              </div>
            </div>

            {/* Checkbox Options */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 pt-2">
              <label className="flex items-center gap-3 p-3 bg-dark-bg/60 border border-dark-border/40 hover:border-dark-muted/40 rounded-xl cursor-pointer select-none">
                <input 
                  type="checkbox"
                  checked={isVegetarian}
                  onChange={(e) => setIsVegetarian(e.target.checked)}
                  className="rounded bg-dark-bg border-dark-border text-eco-green focus:ring-eco-green h-4 w-4"
                />
                <div>
                  <span className="text-xs font-bold text-white block">Vegetarian / Vegan Diet Today</span>
                  <span className="text-[10px] text-dark-muted">Offset high carbon meat chains</span>
                </div>
              </label>

              <label className="flex items-center gap-3 p-3 bg-dark-bg/60 border border-dark-border/40 hover:border-dark-muted/40 rounded-xl cursor-pointer select-none">
                <input 
                  type="checkbox"
                  checked={wasteRecycled}
                  onChange={(e) => setWasteRecycled(e.target.checked)}
                  className="rounded bg-dark-bg border-dark-border text-eco-green focus:ring-eco-green h-4 w-4"
                />
                <div>
                  <span className="text-xs font-bold text-white block">Sorted Recycling & Composting</span>
                  <span className="text-[10px] text-dark-muted">Prevented organic materials landfill waste</span>
                </div>
              </label>
            </div>

            {/* Submit */}
            <div className="flex items-center justify-between mt-4">
              {savedAmount !== null ? (
                <div className="text-xs text-eco-green font-bold flex items-center gap-1 bg-eco-green/10 border border-eco-green/30 px-3 py-1.5 rounded-lg animate-bounce">
                  <Check className="h-4 w-4" /> Saved {savedAmount.toFixed(2)} kg CO2 today!
                </div>
              ) : <div />}

              <button
                type="submit"
                disabled={submitting}
                className="px-6 py-2.5 bg-eco-green hover:bg-eco-lightGreen text-black font-extrabold text-sm rounded-lg flex items-center gap-1.5 transition"
              >
                <LogIn className="h-4 w-4" /> {submitting ? 'Saving log...' : 'Save Daily Log'}
              </button>
            </div>
          </form>
        </div>

        {/* Logs History Table */}
        <div className="glass-panel p-6">
          <h3 className="text-lg font-bold text-white mb-4">Habit Log History</h3>
          {sortedLogs.length === 0 ? (
            <p className="text-dark-muted text-xs">No entries logged yet. Complete the form above to record your first habit.</p>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full text-left text-xs border-collapse">
                <thead>
                  <tr className="border-b border-dark-border/40 text-dark-muted font-semibold">
                    <th className="py-2.5">Date</th>
                    <th>Car Commute</th>
                    <th>Vegetarian Diet</th>
                    <th>Waste Sorted</th>
                    <th className="text-right">CO2 Saved</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-dark-border/25">
                  {sortedLogs.map(log => (
                    <tr key={log.id} className="text-dark-text/90 hover:bg-dark-hover/30 transition">
                      <td className="py-3 font-semibold">
                        {new Date(log.date).toLocaleDateString(undefined, { month: 'short', day: 'numeric', year: 'numeric' })}
                      </td>
                      <td>{log.transportDistance} miles</td>
                      <td>{log.isVegetarian ? '🥦 Yes' : '🍖 No'}</td>
                      <td>{log.wasteRecycled ? '✅ Yes' : '❌ No'}</td>
                      <td className="text-right font-bold text-eco-green">+{log.co2Saved.toFixed(1)} kg</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </div>
      </div>

      {/* Sidebar: Streak Stats */}
      <div className="lg:col-span-1 space-y-6">
        <div className="glass-panel p-6 flex flex-col items-center text-center space-y-4 border-eco-amber/30">
          <div className="p-4 bg-eco-amber/10 text-eco-amber rounded-full animate-pulse">
            <Flame className="h-10 w-10 fill-current" />
          </div>
          <div>
            <span className="text-xs text-dark-muted font-semibold block">Habit Tracking Streak</span>
            <span className="text-4xl font-display font-extrabold text-white mt-1">{streaks.currentStreak}</span>
            <span className="text-xs text-dark-muted block mt-1">consecutive days active</span>
          </div>
          <hr className="border-dark-border/40 w-full" />
          <div className="text-xs text-dark-muted w-full flex justify-between px-2">
            <span>Longest Streak:</span>
            <strong className="text-white">{streaks.longestStreak} days</strong>
          </div>
        </div>

        {/* Milestones info */}
        <div className="glass-panel p-6 space-y-4">
          <h3 className="text-md font-bold text-white flex items-center gap-2">
            <Award className="text-eco-amber" /> Badges Guide
          </h3>
          <div className="space-y-3">
            <div className="flex gap-3 text-xs">
              <span className="text-2xl">🌱</span>
              <div>
                <strong className="text-white block">First Action</strong>
                <span className="text-dark-muted">Log your first daily ecological activity.</span>
              </div>
            </div>
            <div className="flex gap-3 text-xs">
              <span className="text-2xl">📅</span>
              <div>
                <strong className="text-white block">Eco Week</strong>
                <span className="text-dark-muted">Log daily habits for 7 total days.</span>
              </div>
            </div>
            <div className="flex gap-3 text-xs">
              <span className="text-2xl">🔥</span>
              <div>
                <strong className="text-white block">Habit Builder</strong>
                <span className="text-dark-muted">Log details 3 days in a row.</span>
              </div>
            </div>
            <div className="flex gap-3 text-xs">
              <span className="text-2xl">🥦</span>
              <div>
                <strong className="text-white block">Plant Powered</strong>
                <span className="text-dark-muted">Log 5 vegetarian or vegan days.</span>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
