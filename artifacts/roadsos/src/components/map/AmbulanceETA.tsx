import { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Ambulance, Clock } from "lucide-react";

interface Props {
  active: boolean;
}

export default function AmbulanceETA({ active }: Props) {
  const [showETA, setShowETA] = useState(false);
  const [elapsed, setElapsed] = useState(0);

  useEffect(() => {
    if (!active) {
      setShowETA(false);
      setElapsed(0);
      return;
    }

    const timer = setInterval(() => {
      setElapsed((e) => {
        const next = e + 1;
        if (next >= 10) {
          setShowETA(true);
          clearInterval(timer);
        }
        return next;
      });
    }, 1000);

    return () => clearInterval(timer);
  }, [active]);

  if (!active) return null;

  return (
    <AnimatePresence>
      {showETA ? (
        <motion.div
          key="eta"
          initial={{ opacity: 0, scale: 0.9, y: 10 }}
          animate={{ opacity: 1, scale: 1, y: 0 }}
          className="flex items-center gap-3 bg-green-500/10 border border-green-500/30 rounded-2xl px-4 py-3"
          data-testid="ambulance-eta"
        >
          <div className="w-9 h-9 bg-green-500/20 rounded-xl flex items-center justify-center flex-shrink-0">
            <Ambulance className="w-5 h-5 text-green-400" />
          </div>
          <div>
            <p className="text-xs text-green-400 font-bold uppercase tracking-widest">Dispatched</p>
            <p className="text-sm font-semibold text-foreground">Ambulance arriving in 5 minutes</p>
          </div>
          <div className="ml-auto flex-shrink-0">
            <div className="w-2 h-2 rounded-full bg-green-400 animate-pulse" />
          </div>
        </motion.div>
      ) : (
        <motion.div
          key="waiting"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          className="flex items-center gap-3 bg-yellow-500/10 border border-yellow-500/30 rounded-2xl px-4 py-3"
        >
          <div className="w-9 h-9 bg-yellow-500/20 rounded-xl flex items-center justify-center flex-shrink-0">
            <Clock className="w-5 h-5 text-yellow-400 animate-spin" style={{ animationDuration: "3s" }} />
          </div>
          <div className="flex-1">
            <p className="text-xs text-yellow-400 font-bold uppercase tracking-widest">Contacting Services</p>
            <p className="text-sm font-medium text-muted-foreground">Locating nearest ambulance...</p>
          </div>
          <div className="text-xs text-yellow-400 font-mono font-bold ml-auto flex-shrink-0">
            {10 - elapsed}s
          </div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}
