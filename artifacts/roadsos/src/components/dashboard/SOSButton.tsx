import { motion } from 'framer-motion';
import { AlertTriangle } from 'lucide-react';
import { useLocation } from 'wouter';

export default function SOSButton() {
  const [, setLocation] = useLocation();

  return (
    <div className="flex flex-col items-center justify-center py-10 relative">
      <div className="absolute inset-0 flex items-center justify-center pointer-events-none">
        <motion.div
          animate={{ scale: [1, 1.5], opacity: [0.3, 0] }}
          transition={{ duration: 2, repeat: Infinity, ease: "easeOut" }}
          className="absolute w-48 h-48 rounded-full bg-primary/30"
        />
        <motion.div
          animate={{ scale: [1, 1.8], opacity: [0.2, 0] }}
          transition={{ duration: 2, repeat: Infinity, ease: "easeOut", delay: 0.5 }}
          className="absolute w-48 h-48 rounded-full bg-primary/20"
        />
      </div>

      <motion.button
        whileHover={{ scale: 1.05 }}
        whileTap={{ scale: 0.95 }}
        onClick={() => setLocation('/sos')}
        className="relative z-10 w-48 h-48 rounded-full bg-gradient-to-b from-primary to-red-700 shadow-[0_0_50px_rgba(239,68,68,0.5)] border-[6px] border-[#0a0a0f] flex flex-col items-center justify-center overflow-hidden"
        data-testid="btn-sos-main"
      >
        <div className="absolute inset-0 bg-black/10"></div>
        <div className="absolute top-0 left-0 right-0 h-1/2 bg-white/10 rounded-t-full"></div>
        
        <AlertTriangle className="w-14 h-14 text-white mb-2 drop-shadow-[0_2px_4px_rgba(0,0,0,0.4)]" />
        <span className="text-white font-black text-3xl tracking-[0.2em] drop-shadow-[0_2px_4px_rgba(0,0,0,0.4)]">SOS</span>
      </motion.button>
      
      <p className="mt-8 text-muted-foreground uppercase tracking-widest text-xs font-bold bg-[#0a0a0f] px-4 py-2 rounded-full border border-white/5">Tap for Emergency</p>
    </div>
  );
}