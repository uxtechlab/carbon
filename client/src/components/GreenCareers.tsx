import React, { useState } from 'react';
import { useApp } from '../context/AppContext';
import type { GreenCareer } from '../context/AppContext';
import { Briefcase, Compass, Search, ArrowRight, BookOpen, AlertCircle, Loader2, Sparkles, TrendingDown } from 'lucide-react';

export const GreenCareers: React.FC = () => {
  const { recommendCareerPath, recommendedCareer, recommendationLoading, careers, footprints } = useApp();
  const [skills, setSkills] = useState('');
  const [interest, setInterest] = useState<'tech-ai' | 'data-science' | 'renewable-energy' | 'policy-consulting' | 'circular-economy'>('tech-ai');
  const [searchVal, setSearchVal] = useState('');

  const latestRecord = footprints.length > 0 ? footprints[footprints.length - 1] : null;

  const handleMatch = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!skills.trim()) return;
    await recommendCareerPath(skills, interest);
  };

  const handleSelectCareer = async (career: GreenCareer) => {
    const defaultSkills = career.skillsRequired.slice(0, 2).join(', ');
    setSkills(defaultSkills);
    setInterest(career.category);
    await recommendCareerPath(defaultSkills, career.category);
    
    // Smooth scroll to results
    const resultsPanel = document.getElementById('matching-results');
    resultsPanel?.scrollIntoView({ behavior: 'smooth' });
  };

  const filteredCareers = careers.filter(c => 
    c.title.toLowerCase().includes(searchVal.toLowerCase()) || 
    c.description.toLowerCase().includes(searchVal.toLowerCase()) ||
    c.skillsRequired.some(s => s.toLowerCase().includes(searchVal.toLowerCase()))
  );

  // Markdown renderer helper
  const renderMarkdown = (text: string) => {
    if (!text) return null;
    return text.split('\n').map((line, idx) => {
      if (line.startsWith('### ')) {
        return <h3 key={idx} className="text-lg font-bold text-eco-lightGreen mt-4 mb-2">{line.replace('### ', '')}</h3>;
      }
      if (line.startsWith('#### ')) {
        return <h4 key={idx} className="text-md font-bold text-white mt-3 mb-1">{line.replace('#### ', '')}</h4>;
      }
      if (line.startsWith('**') && line.endsWith('**')) {
        return <strong key={idx} className="text-white block mt-2">{line.replace(/\*\*/g, '')}</strong>;
      }
      if (line.trim().startsWith('* ') || line.trim().startsWith('- ')) {
        const content = line.trim().replace(/^[\*\-]\s+/, '');
        // simple bold formatting check
        const parts = content.split('**');
        return (
          <ul key={idx} className="list-disc list-inside ml-4 text-dark-text/90 text-xs my-1 leading-relaxed">
            <li>
              {parts.map((p, i) => i % 2 === 1 ? <strong key={i} className="text-white font-bold">{p}</strong> : p)}
            </li>
          </ul>
        );
      }
      if (line.trim() === '') return <div key={idx} className="h-2" />;
      // bold format for normal lines
      const parts = line.split('**');
      return (
        <p key={idx} className="text-xs text-dark-text/95 leading-relaxed my-1.5">
          {parts.map((p, i) => i % 2 === 1 ? <strong key={i} className="text-white font-bold">{p}</strong> : p)}
        </p>
      );
    });
  };

  return (
    <div className="space-y-8 animate-fade-in">
      {/* Header */}
      <div>
        <h1 className="text-3xl font-display font-bold text-white flex items-center gap-2">
          <Briefcase className="text-eco-green" /> Green Career & AI Roadmap Advisor
        </h1>
        <p className="text-dark-muted mt-1">Discover eco-centric tech careers, match your capabilities, and design your transition roadmap.</p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Left Form: Skills Matcher */}
        <div className="lg:col-span-1 space-y-6">
          <div className="glass-panel p-6 space-y-4">
            <h3 className="text-lg font-bold text-white flex items-center gap-2">
              <Compass className="text-eco-green h-5 w-5" /> Skill-Career Matcher
            </h3>
            <p className="text-xs text-dark-muted">Input your current technical skills and choose a green industry segment to find your path.</p>
            
            <hr className="border-dark-border/40" />

            <form onSubmit={handleMatch} className="space-y-4">
              {/* Skills */}
              <div className="space-y-1">
                <label className="text-xs font-semibold text-dark-muted">Your Skills</label>
                <input
                  type="text"
                  placeholder="e.g. React, Python, Excel, Writing, CAD"
                  value={skills}
                  onChange={(e) => setSkills(e.target.value)}
                  required
                  className="w-full p-2.5 bg-dark-bg border border-dark-border rounded-lg text-white text-xs focus:outline-none focus:border-eco-green transition"
                />
              </div>

              {/* Interest area */}
              <div className="space-y-1">
                <label className="text-xs font-semibold text-dark-muted">Sectors of Interest</label>
                <select
                  value={interest}
                  onChange={(e) => setInterest(e.target.value as any)}
                  className="w-full p-2.5 bg-dark-bg border border-dark-border rounded-lg text-white text-xs focus:outline-none focus:border-eco-green transition"
                >
                  <option value="tech-ai">Tech & AI Sustainability</option>
                  <option value="data-science">Climate Data Science</option>
                  <option value="renewable-energy">Renewable & Clean Energy</option>
                  <option value="circular-economy">Circular Design & Product Lifecycle</option>
                  <option value="policy-consulting">ESG & Environmental Policy</option>
                </select>
              </div>

              <button
                type="submit"
                disabled={recommendationLoading || !skills.trim()}
                className="w-full py-2.5 bg-eco-green hover:bg-eco-lightGreen disabled:bg-eco-green/45 text-black font-extrabold text-xs rounded-lg flex items-center justify-center gap-1.5 transition"
              >
                {recommendationLoading ? (
                  <>
                    <Loader2 className="h-4 w-4 animate-spin" /> Matching...
                  </>
                ) : (
                  <>
                    Match Career Path <ArrowRight className="h-4 w-4" />
                  </>
                )}
              </button>
            </form>
          </div>

          {/* Quick FAQ / Info */}
          <div className="glass-panel p-6 space-y-3">
            <h4 className="text-sm font-bold text-white flex items-center gap-1.5">
              <AlertCircle className="text-eco-blue h-4 w-4" /> What is Carbon Reduction Potential?
            </h4>
            <p className="text-[11px] text-dark-muted leading-relaxed">
              This measures the estimated average annual offset (in tons of CO2e) achieved by optimized grid control, industrial waste circularity, or clean power generation managed by a professional in this role.
            </p>
          </div>
        </div>

        {/* Right Section: Matches & Roadmap */}
        <div id="matching-results" className="lg:col-span-2 space-y-6">
          {recommendedCareer ? (
            <div className="glass-panel p-8 space-y-6 relative border-eco-green/30">
              {recommendationLoading && (
                <div className="absolute inset-0 bg-dark-card/85 backdrop-blur-sm flex flex-col items-center justify-center space-y-2 rounded-2xl z-10">
                  <Loader2 className="h-10 w-10 text-eco-green animate-spin" />
                  <span className="text-sm text-dark-muted">Mapping career pathways...</span>
                </div>
              )}

              {/* Match Header */}
              <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 border-b border-dark-border/40 pb-4">
                <div>
                  <span className="px-2 py-1 bg-eco-green/15 text-eco-green text-[10px] font-bold uppercase rounded">
                    Match Found (Score: 94%)
                  </span>
                  <h2 className="text-2xl font-bold text-white mt-2">
                    {recommendedCareer.career.title}
                  </h2>
                  <span className="text-xs text-dark-muted block mt-1 capitalize">
                    Industry Segment: {recommendedCareer.career.category.replace('-', ' ')}
                  </span>
                </div>

                <div className="bg-dark-bg/60 border border-dark-border/60 rounded-xl p-3 text-center min-w-[120px]">
                  <span className="text-[10px] text-dark-muted block uppercase font-semibold">Annual Offset</span>
                  <span className="text-lg font-extrabold text-eco-green">{recommendedCareer.career.co2ReductionPotential} Tons</span>
                  <span className="text-[9px] text-dark-muted block">CO2e / Year</span>
                </div>
              </div>

              {/* Stats Row */}
              <div className="grid grid-cols-3 gap-4 text-center">
                <div className="p-2.5 bg-dark-bg/40 border border-dark-border/30 rounded-xl">
                  <span className="text-[9px] text-dark-muted block">Global Demand</span>
                  <strong className="text-xs text-white">{recommendedCareer.career.demandLevel}</strong>
                </div>
                <div className="p-2.5 bg-dark-bg/40 border border-dark-border/30 rounded-xl">
                  <span className="text-[9px] text-dark-muted block">Avg Salary Range</span>
                  <strong className="text-xs text-white">{recommendedCareer.career.salaryRange}</strong>
                </div>
                <div className="p-2.5 bg-dark-bg/40 border border-dark-border/30 rounded-xl">
                  <span className="text-[9px] text-dark-muted block">Category</span>
                  <strong className="text-xs text-white capitalize">{recommendedCareer.career.category.replace('-', ' ')}</strong>
                </div>
              </div>

              {/* Career description */}
              <div className="space-y-2">
                <h4 className="text-sm font-bold text-white">Role Description</h4>
                <p className="text-xs text-dark-muted leading-relaxed">{recommendedCareer.career.description}</p>
              </div>

              {/* Transferable Skills match explanation */}
              <div className="p-4 bg-eco-green/5 border border-eco-green/20 rounded-xl space-y-2">
                <h4 className="text-xs font-bold text-eco-green flex items-center gap-1">
                  <Sparkles className="h-4 w-4" /> Transferable Fit & Context
                </h4>
                <p className="text-xs text-dark-text/90 leading-relaxed">
                  {recommendedCareer.matchingExplanation}
                </p>
                {latestRecord && (
                  <div className="pt-2 border-t border-eco-green/10 text-[11px] text-dark-muted flex items-center gap-1">
                    <TrendingDown className="h-3.5 w-3.5 text-eco-green" /> 
                    <span>
                      This role offsets **{recommendedCareer.career.co2ReductionPotential} tons/year**, which is **{((recommendedCareer.career.co2ReductionPotential * 1000) / latestRecord.total).toFixed(1)}x** greater than your personal footprint of **{(latestRecord.total / 1000).toFixed(1)} tons**!
                    </span>
                  </div>
                )}
              </div>

              {/* Transition Roadmap */}
              <div className="space-y-3 pt-2">
                <h4 className="text-sm font-bold text-white flex items-center gap-1.5">
                  <BookOpen className="text-eco-blue h-4 w-4" /> Custom Transition Roadmap
                </h4>
                <div className="bg-dark-bg/50 border border-dark-border/40 p-6 rounded-2xl overflow-y-auto max-h-[360px] prose-slate">
                  {renderMarkdown(recommendedCareer.roadmap)}
                </div>
              </div>
            </div>
          ) : (
            <div className="glass-panel p-8 text-center text-dark-muted space-y-3">
              <Compass className="mx-auto text-dark-border h-12 w-12" />
              <h3 className="text-white font-bold text-lg">Your Roadmap Awaits</h3>
              <p className="max-w-md mx-auto text-sm">
                Enter your coding languages or technical capabilities in the matcher panel, or explore and select a career card from the list below to build your learning path.
              </p>
            </div>
          )}
        </div>
      </div>

      {/* Curated Career list explorer */}
      <div className="space-y-4">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
          <h2 className="text-xl font-bold text-white flex items-center gap-2">
            <Briefcase className="text-eco-blue h-5 w-5" /> Green Careers Explorer
          </h2>
          
          {/* Search box */}
          <div className="relative w-full md:w-64">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-dark-muted h-4 w-4" />
            <input
              type="text"
              placeholder="Search careers..."
              value={searchVal}
              onChange={(e) => setSearchVal(e.target.value)}
              className="w-full bg-dark-card border border-dark-border/60 rounded-lg pl-9 pr-3 py-1.5 text-xs text-white focus:outline-none focus:border-eco-blue transition"
            />
          </div>
        </div>

        {/* Explorer Cards grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {filteredCareers.map(career => (
            <div 
              key={career.id} 
              onClick={() => handleSelectCareer(career)}
              className="glass-panel glass-panel-hover p-6 flex flex-col justify-between space-y-4 border-dark-border/60 cursor-pointer hover:border-eco-blue/30"
            >
              <div>
                <div className="flex justify-between items-start gap-2">
                  <h3 className="text-md font-bold text-white leading-tight">
                    {career.title}
                  </h3>
                  <span className="text-[9px] font-bold px-2 py-0.5 bg-dark-bg/60 border border-dark-border/45 text-eco-green rounded">
                    {career.co2ReductionPotential}t CO2e
                  </span>
                </div>
                <p className="text-[11px] text-dark-muted mt-2 line-clamp-3 leading-relaxed">{career.description}</p>
              </div>

              <div className="space-y-3">
                {/* Skills tags */}
                <div className="flex flex-wrap gap-1">
                  {career.skillsRequired.slice(0, 3).map((s, i) => (
                    <span key={i} className="text-[9px] bg-dark-bg/50 border border-dark-border/30 text-dark-text/80 px-2 py-0.5 rounded">
                      {s}
                    </span>
                  ))}
                  {career.skillsRequired.length > 3 && (
                    <span className="text-[9px] text-dark-muted px-1">+{career.skillsRequired.length - 3} more</span>
                  )}
                </div>

                <hr className="border-dark-border/30" />

                <div className="flex justify-between items-center text-[10px] text-dark-muted">
                  <span>Salary: <strong className="text-white">{career.salaryRange.split(' - ')[0]}</strong></span>
                  <span className="text-eco-blue font-bold flex items-center gap-0.5">
                    Generate Roadmap <ArrowRight className="h-3 w-3" />
                  </span>
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};
