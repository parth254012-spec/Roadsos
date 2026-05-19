import { useState, useRef, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { getEmergencyAdvice } from '@/services/gemini';
import { useLocation } from '@/hooks/useLocation';
import { Bot, Send, User } from 'lucide-react';
import { ScrollArea } from '@/components/ui/scroll-area';
import { motion } from 'framer-motion';

export default function AIAssistant() {
  const [input, setInput] = useState('');
  const [messages, setMessages] = useState<{role: 'user'|'ai', content: string}[]>([
    { role: 'ai', content: 'I am your emergency AI assistant. Describe your situation for immediate advice.' }
  ]);
  const [loading, setLoading] = useState(false);
  const { lat, lng } = useLocation();
  const scrollRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (scrollRef.current) {
      scrollRef.current.scrollIntoView({ behavior: 'smooth' });
    }
  }, [messages, loading]);

  const handleSend = async () => {
    if (!input.trim() || loading) return;

    const userMsg = input.trim();
    setMessages(prev => [...prev, { role: 'user', content: userMsg }]);
    setInput('');
    setLoading(true);

    try {
      const locStr = lat && lng ? `${lat}, ${lng}` : undefined;
      const advice = await getEmergencyAdvice(userMsg, locStr);
      setMessages(prev => [...prev, { role: 'ai', content: advice }]);
    } catch (error) {
      setMessages(prev => [...prev, { role: 'ai', content: 'Sorry, I could not fetch advice right now. Please call emergency services immediately.' }]);
    } finally {
      setLoading(false);
    }
  };

  const suggestPrompt = (text: string) => {
    setInput(text);
  };

  const formatMessage = (content: string) => {
    return content.split('\n').map((line, i) => {
      if (line.trim().startsWith('-')) {
        return <div key={i} className="flex items-start gap-2 mt-1"><span className="text-primary mt-[2px]">•</span> <span>{line.substring(1).trim()}</span></div>;
      }
      return <div key={i} className={i > 0 ? "mt-2" : ""}>{line}</div>;
    });
  };

  const suggestions = [
    "I had an accident",
    "Car broke down",
    "Panic attack help",
    "First aid guidance",
    "Nearest hospital?"
  ];

  return (
    <div className="flex flex-col h-[500px] glass-dark border border-white/10 rounded-2xl overflow-hidden relative">
      <div className="px-5 py-4 border-b border-white/10 bg-[#0a0a0f]/80 backdrop-blur flex items-center justify-between z-10">
        <div className="flex items-center gap-3">
          <div className="w-8 h-8 rounded-full bg-primary/20 flex items-center justify-center border border-primary/30">
            <Bot className="w-4 h-4 text-primary" />
          </div>
          <span className="font-semibold text-sm tracking-wide text-foreground">AI Advisor</span>
        </div>
        <div className="flex items-center gap-2 px-2 py-1 rounded-full bg-green-500/10 border border-green-500/20 text-green-500 text-[10px] font-medium uppercase tracking-widest">
          <div className="w-1.5 h-1.5 rounded-full bg-green-500 animate-pulse"></div>
          Connected
        </div>
      </div>
      
      <ScrollArea className="flex-1 p-5">
        <div className="space-y-6 pb-2">
          {messages.map((msg, i) => (
            <motion.div 
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              key={i} 
              className={`flex ${msg.role === 'user' ? 'justify-end' : 'justify-start'}`}
            >
              {msg.role === 'ai' && (
                <div className="w-6 h-6 rounded-full bg-secondary border border-white/10 flex items-center justify-center mr-2 shrink-0 mt-1">
                  <Bot className="w-3 h-3 text-muted-foreground" />
                </div>
              )}
              <div className={`max-w-[80%] rounded-2xl p-3.5 text-sm leading-relaxed ${
                msg.role === 'user' 
                  ? 'bg-primary text-primary-foreground rounded-tr-sm' 
                  : 'glass-dark border border-white/10 text-foreground rounded-tl-sm'
              }`}>
                {formatMessage(msg.content)}
              </div>
            </motion.div>
          ))}
          
          {loading && (
            <motion.div 
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              className="flex justify-start"
            >
              <div className="w-6 h-6 rounded-full bg-secondary border border-white/10 flex items-center justify-center mr-2 shrink-0 mt-1">
                <Bot className="w-3 h-3 text-muted-foreground" />
              </div>
              <div className="glass-dark border border-white/10 rounded-2xl rounded-tl-sm p-3.5">
                <div className="flex gap-1.5 items-center px-2 py-1">
                  {[0, 1, 2].map(i => (
                    <motion.div key={i}
                      className="w-1.5 h-1.5 rounded-full bg-muted-foreground"
                      animate={{ y: [0, -4, 0] }}
                      transition={{ repeat: Infinity, duration: 0.6, delay: i * 0.15 }}
                    />
                  ))}
                </div>
              </div>
            </motion.div>
          )}
          <div ref={scrollRef} />
        </div>
      </ScrollArea>

      <div className="p-4 bg-[#0a0a0f]/90 border-t border-white/10 backdrop-blur z-10 space-y-3">
        <div className="flex gap-2 overflow-x-auto pb-1 hide-scrollbar -mx-2 px-2">
          {suggestions.map(p => (
            <button 
              key={p} 
              className="whitespace-nowrap rounded-full text-xs font-medium px-3 py-1.5 border border-white/10 bg-secondary/50 text-muted-foreground hover:text-foreground hover:bg-secondary active:scale-95 transition-all"
              onClick={() => suggestPrompt(p)}
              data-testid={`suggest-${p.replace(/\s+/g, '-').toLowerCase()}`}
            >
              {p}
            </button>
          ))}
        </div>
        
        <form onSubmit={e => { e.preventDefault(); handleSend(); }} className="relative flex items-center">
          <Input 
            value={input} 
            onChange={e => setInput(e.target.value)} 
            placeholder="Type your emergency..." 
            className="w-full bg-[#0a0a0f] border border-white/20 rounded-full pl-4 pr-12 h-12 focus-visible:ring-1 focus-visible:ring-primary/50 text-sm"
            data-testid="ai-input"
          />
          <button 
            type="submit" 
            disabled={loading || !input.trim()}
            className="absolute right-1.5 w-9 h-9 rounded-full bg-primary flex items-center justify-center text-primary-foreground disabled:opacity-50 disabled:bg-muted active:scale-95 transition-all"
            data-testid="ai-send"
          >
            <Send className="w-4 h-4" />
          </button>
        </form>
      </div>
    </div>
  );
}