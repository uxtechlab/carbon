import React, { useState, useEffect, useRef } from 'react';
import { useApp } from '../context/AppContext';
import { Bot, User, Send, Sparkles, HelpCircle, Loader2 } from 'lucide-react';

interface ChatMessage {
  id: string;
  sender: 'coach' | 'user';
  text: string;
  timestamp: Date;
}

export const AICoach: React.FC = () => {
  const { coachAnalysis, coachLoading, getCoachReport, footprints } = useApp();
  const [messages, setMessages] = useState<ChatMessage[]>([]);
  const [inputVal, setInputVal] = useState('');
  const [chatLoading, setChatLoading] = useState(false);
  const chatEndRef = useRef<HTMLDivElement>(null);

  const latestRecord = footprints.length > 0 ? footprints[footprints.length - 1] : null;

  useEffect(() => {
    // Generate initial analysis if not loaded
    if (!coachAnalysis && latestRecord) {
      getCoachReport();
    }
  }, [coachAnalysis, latestRecord]);

  useEffect(() => {
    // Initialize chat messages with a welcoming message
    if (messages.length === 0) {
      setMessages([
        {
          id: 'welcome',
          sender: 'coach',
          text: `Hello! I am your EcoCoach AI. I have reviewed your emissions profile. How can I help you optimize your habits today? Feel free to ask questions like "How do I switch to green energy?" or tap one of the suggested prompts below!`,
          timestamp: new Date()
        }
      ]);
    }
  }, []);

  useEffect(() => {
    chatEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages, chatLoading]);

  // Quick helper to render markdown inside glassmorphism
  const renderMarkdownText = (text: string) => {
    if (!text) return null;
    
    return text.split('\n').map((line, idx) => {
      // Headers
      if (line.startsWith('### ')) {
        return <h3 key={idx} className="text-lg font-bold text-eco-lightGreen mt-4 mb-2">{line.replace('### ', '')}</h3>;
      }
      if (line.startsWith('#### ')) {
        return <h4 key={idx} className="text-md font-bold text-white mt-3 mb-1">{line.replace('#### ', '')}</h4>;
      }
      if (line.startsWith('## ')) {
        return <h2 key={idx} className="text-xl font-extrabold text-white mt-5 mb-2">{line.replace('## ', '')}</h2>;
      }
      
      // Bullets
      if (line.trim().startsWith('* ') || line.trim().startsWith('- ')) {
        const content = line.trim().replace(/^[\*\-]\s+/, '');
        // Check for bold parts
        return (
          <ul key={idx} className="list-disc list-inside ml-4 text-dark-text/90 text-sm space-y-1 my-1">
            <li>{renderBoldText(content)}</li>
          </ul>
        );
      }

      // Normal text
      if (line.trim() === '') return <div key={idx} className="h-2" />;
      return <p key={idx} className="text-sm text-dark-text/95 leading-relaxed my-2">{renderBoldText(line)}</p>;
    });
  };

  const renderBoldText = (text: string) => {
    const parts = text.split('**');
    return parts.map((part, i) => {
      if (i % 2 === 1) {
        return <strong key={i} className="text-white font-semibold">{part}</strong>;
      }
      return part;
    });
  };

  const handleSendMessage = async (text: string) => {
    if (!text.trim()) return;
    
    const userMsg: ChatMessage = {
      id: Math.random().toString(36).substring(2, 11),
      sender: 'user',
      text,
      timestamp: new Date()
    };
    
    setMessages(prev => [...prev, userMsg]);
    setInputVal('');
    setChatLoading(true);

    // Call chatbot simulator (Gemini or local heuristic)
    try {
      let replyText = '';
      const textLower = text.toLowerCase();

      // Actually we will simulate the chatbot locally or trigger a generic API call if we had it.
      // A robust heuristic responder yields extremely tailored results for a coach context:
      if (textLower.includes('energy') || textLower.includes('solar') || textLower.includes('heating') || textLower.includes('electricity')) {
        replyText = `Reducing electricity emissions involves both efficiency and sourcing. 
1. **LED Transition**: Swapping 10 bulbs to LEDs offsets ~150kg CO2/year.
2. **Phantom Loads**: Unplug chargers, TVs, and microwave clocks when unused.
3. **Green Tariffs**: Switch your utility provider to a 100% renewable plan or purchase community solar credits.
4. **Thermostat**: Lowering your heating by 2°F saves 8-10% of heating bills.`;
      } else if (textLower.includes('transport') || textLower.includes('car') || textLower.includes('flight') || textLower.includes('commute')) {
        replyText = `Transportation accounts for a massive slice of emissions.
1. **Eco-Driving**: Avoid hard braking and maintain a steady highway pace to boost MPG by 5%.
2. **EV vs ICE**: Driving an EV offsets 70-80% of carbon output compared to a petrol car.
3. **Flight offsets**: While carbon offset projects help, avoiding flights is key. For regional travel, prefer trains.
4. **Commute Swaps**: Try walking or biking for trips under 2 miles.`;
      } else if (textLower.includes('food') || textLower.includes('meat') || textLower.includes('vegetarian') || textLower.includes('diet') || textLower.includes('compost')) {
        replyText = `Food systems create greenhouse gases through land use, transport, and methane release.
1. **Methane**: Rotting food in landfills produces methane. Composting organic waste redirects it and creates nutrient soil.
2. **Beef Impact**: Beef requires 20x more land and emits 10x more greenhouse gas per gram of protein than beans.
3. **Local Food**: Sourcing local produce eliminates long-distance cargo emissions.`;
      } else if (textLower.includes('water') || textLower.includes('shower') || textLower.includes('leak')) {
        replyText = `Water pumping and heating consume energy:
1. **Showers**: 5-minute showers instead of 10-minute ones save 25 gallons of hot water.
2. **Low-flow aerators**: Attach them to sinks. It cuts flow rates from 2.5 gpm to 1.5 gpm without affecting pressure.
3. **Laundry**: Wash clothes in cold water. Heating the water makes up 90% of a washing machine's electrical use.`;
      } else {
        replyText = `I recommend starting with your custom Action Items. Toggling action items like **Switch to LED bulbs** or **Eat vegetarian 3 days/week** on your checklist directly recalculates your carbon goals. What specific area of your dashboard would you like to deep-dive into?`;
      }

      // Add delay for realism
      setTimeout(() => {
        setMessages(prev => [...prev, {
          id: Math.random().toString(36).substring(2, 11),
          sender: 'coach',
          text: replyText,
          timestamp: new Date()
        }]);
        setChatLoading(false);
      }, 800);

    } catch (err) {
      setChatLoading(false);
    }
  };

  const SUGGESTIONS = [
    'How can I lower my Energy emissions?',
    'What is the impact of a vegetarian diet?',
    'Tell me how composting helps reduce methane.',
    'Tips for lowering transport footprint.'
  ];

  return (
    <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 animate-fade-in">
      {/* Sidebar: Highlights */}
      <div className="lg:col-span-1 space-y-6">
        <div className="glass-panel p-6 space-y-4">
          <h3 className="text-lg font-bold text-white flex items-center gap-2">
            <Sparkles className="text-eco-amber h-5 w-5" /> Coach Insights
          </h3>
          <p className="text-xs text-dark-muted">Insights are generated in real-time by analyzing your latest calculations.</p>
          
          <hr className="border-dark-border/40" />

          {latestRecord ? (
            <div className="space-y-4 text-sm">
              <div className="p-3 bg-dark-bg/60 border border-dark-border/30 rounded-xl space-y-1">
                <span className="text-dark-muted text-xs block">Top Carbon Source</span>
                <span className="text-white font-bold text-md">{coachAnalysis?.topSource || 'Analyzing...'}</span>
              </div>
              <div className="p-3 bg-dark-bg/60 border border-dark-border/30 rounded-xl space-y-1">
                <span className="text-dark-muted text-xs block">Carbon Footprint Status</span>
                <span className="text-white font-bold text-md">
                  {latestRecord.total < 4000 ? 'Low Impact 🌿' : latestRecord.total < 10000 ? 'Moderate ⚡' : 'High Impact 🔥'}
                </span>
              </div>
            </div>
          ) : (
            <p className="text-dark-muted text-xs">No records available yet. Please complete a carbon calculation.</p>
          )}
        </div>

        {/* Suggested Prompts */}
        <div className="glass-panel p-6 space-y-4">
          <h3 className="text-sm font-bold text-white flex items-center gap-2">
            <HelpCircle className="text-eco-blue h-4 w-4" /> Quick Prompts
          </h3>
          <div className="flex flex-col gap-2">
            {SUGGESTIONS.map((s, i) => (
              <button
                key={i}
                onClick={() => handleSendMessage(s)}
                disabled={chatLoading}
                className="text-left text-xs p-2.5 bg-dark-bg/60 border border-dark-border/40 text-dark-text/95 rounded-lg hover:border-eco-green/40 hover:bg-dark-hover transition text-ellipsis overflow-hidden whitespace-nowrap"
              >
                {s}
              </button>
            ))}
          </div>
        </div>
      </div>

      {/* Main Area: Coach Report & Chat */}
      <div className="lg:col-span-2 space-y-6">
        {/* Coach Analysis Report */}
        <div className="glass-panel p-8 space-y-4 relative min-h-[250px]">
          {coachLoading ? (
            <div className="absolute inset-0 bg-dark-card/80 backdrop-blur-sm flex flex-col items-center justify-center space-y-2 rounded-2xl z-10">
              <Loader2 className="h-10 w-10 text-eco-green animate-spin" />
              <span className="text-sm text-dark-muted">EcoCoach is compiling your report...</span>
            </div>
          ) : null}

          {coachAnalysis ? (
            <div className="prose prose-invert max-w-none">
              {renderMarkdownText(coachAnalysis.analysis)}
            </div>
          ) : (
            <div className="text-center py-12 text-dark-muted">
              Please run your carbon footprint calculator first to generate coaching reports.
            </div>
          )}
        </div>

        {/* Chat Box */}
        <div className="glass-panel flex flex-col h-[400px]">
          {/* Chat Header */}
          <div className="p-4 border-b border-dark-border/40 flex items-center gap-3 bg-dark-card/85">
            <div className="w-8 h-8 rounded-full bg-eco-green/20 flex items-center justify-center text-eco-green">
              <Bot className="h-5 w-5" />
            </div>
            <div>
              <span className="text-sm font-bold text-white block">EcoCoach AI Chat</span>
              <span className="text-xs text-eco-green">Online & Ready</span>
            </div>
          </div>

          {/* Chat Messages */}
          <div className="flex-1 overflow-y-auto p-4 space-y-4">
            {messages.map((msg) => (
              <div 
                key={msg.id} 
                className={`flex gap-3 max-w-[85%] ${msg.sender === 'user' ? 'ml-auto flex-row-reverse' : ''}`}
              >
                <div className={`w-8 h-8 rounded-full flex items-center justify-center flex-shrink-0 ${
                  msg.sender === 'user' ? 'bg-eco-blue/20 text-eco-blue' : 'bg-eco-green/20 text-eco-green'
                }`}>
                  {msg.sender === 'user' ? <User className="h-4 w-4" /> : <Bot className="h-4 w-4" />}
                </div>
                <div className={`p-3 rounded-2xl text-sm ${
                  msg.sender === 'user' 
                    ? 'bg-eco-blue/10 border border-eco-blue/25 text-white rounded-tr-none' 
                    : 'bg-dark-bg/80 border border-dark-border/50 text-dark-text/95 rounded-tl-none'
                }`}>
                  <p className="whitespace-pre-line leading-relaxed">{msg.text}</p>
                </div>
              </div>
            ))}
            {chatLoading && (
              <div className="flex gap-3 max-w-[85%]">
                <div className="w-8 h-8 rounded-full bg-eco-green/20 text-eco-green flex items-center justify-center">
                  <Bot className="h-4 w-4" />
                </div>
                <div className="p-3 bg-dark-bg/80 border border-dark-border/50 text-dark-muted rounded-2xl rounded-tl-none flex items-center gap-2">
                  <Loader2 className="h-4 w-4 animate-spin text-eco-green" />
                  <span className="text-xs">Typing...</span>
                </div>
              </div>
            )}
            <div ref={chatEndRef} />
          </div>

          {/* Chat Input */}
          <div className="p-3 border-t border-dark-border/40 bg-dark-bg/50">
            <form 
              onSubmit={(e) => {
                e.preventDefault();
                handleSendMessage(inputVal);
              }}
              className="flex gap-2"
            >
              <input
                type="text"
                placeholder="Ask EcoCoach a question..."
                value={inputVal}
                onChange={(e) => setInputVal(e.target.value)}
                disabled={chatLoading}
                className="flex-1 bg-dark-card border border-dark-border/70 rounded-xl px-4 py-2 text-sm text-white focus:outline-none focus:border-eco-green transition"
              />
              <button
                type="submit"
                disabled={chatLoading || !inputVal.trim()}
                className="p-2 bg-eco-green hover:bg-eco-lightGreen disabled:bg-eco-green/30 disabled:cursor-not-allowed text-black rounded-xl transition duration-200"
              >
                <Send className="h-4 w-4" />
              </button>
            </form>
          </div>
        </div>
      </div>
    </div>
  );
};
