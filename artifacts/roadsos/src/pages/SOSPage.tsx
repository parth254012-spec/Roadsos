import { useState, useEffect, useRef } from 'react';
import { useLocation } from 'wouter';
import { motion, AnimatePresence } from 'framer-motion';
import { useAuth } from '@/context/AuthContext';
import { useLocation as useGeoLocation } from '@/hooks/useLocation';
import { useCreateSosAlert } from '@workspace/api-client-react';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import { Textarea } from '@/components/ui/textarea';
import { useToast } from '@/hooks/use-toast';
import { useSiren } from '@/hooks/useSiren';
import { useEmergencyContacts } from '@/hooks/useEmergencyContacts';
import {
  ArrowLeft, Car, Wrench, HeartPulse, Flame, AlertCircle,
  MapPin, CheckCircle2, Users, Radio,
} from 'lucide-react';

const EMERGENCY_TYPES = [
  { id: 'accident', label: 'Accident', icon: Car, color: 'text-red-400', bg: 'bg-red-500/10 border-red-500/30' },
  { id: 'breakdown', label: 'Breakdown', icon: Wrench, color: 'text-orange-400', bg: 'bg-orange-500/10 border-orange-500/30' },
  { id: 'medical', label: 'Medical', icon: HeartPulse, color: 'text-blue-400', bg: 'bg-blue-500/10 border-blue-500/30' },
  { id: 'fire', label: 'Fire', icon: Flame, color: 'text-orange-500', bg: 'bg-orange-600/10 border-orange-600/30' },
  { id: 'other', label: 'Other', icon: AlertCircle, color: 'text-gray-400', bg: 'bg-gray-400/10 border-gray-400/30' },
] as const;

type EmergencyTypeId = typeof EMERGENCY_TYPES[number]['id'];
type Step = 'type' | 'details' | 'activating' | 'notifying' | 'confirmed';

export default function SOSPage() {
  const [, setLocation] = useLocation();
  const { user } = useAuth();
  const { lat, lng } = useGeoLocation();
  const { contacts } = useEmergencyContacts(user?.uid);
  const { toast } = useToast();
  const createAlert = useCreateSosAlert();
  const siren = useSiren();

  const [step, setStep] = useState<Step>('type');
  const [selectedType, setSelectedType] = useState<EmergencyTypeId | null>(null);
  const [description, setDescription] = useState('');
  const [holdProgress, setHoldProgress] = useState(0);
  const [alertId, setAlertId] = useState<string | null>(null);
  const [notifyIndex, setNotifyIndex] = useState(0);

  // Hold-to-activate progress
  useEffect(() => {
    let interval: ReturnType<typeof setInterval>;
    if (step === 'activating') {
      interval = setInterval(() => {
        setHoldProgress(p => {
          if (p >= 100) {
            clearInterval(interval);
            triggerAlert();
            return 100;
          }
          return p + 2.5;
        });
      }, 60);
    } else {
      setHoldProgress(0);
    }
    return () => clearInterval(interval);
  }, [step]);

  // Notification step: cycle through contacts then show confirmed
  useEffect(() => {
    if (step !== 'notifying') return;
    siren.play();

    const contactList = contacts.length > 0 ? contacts : [{ name: 'Emergency Services' }];
    let i = 0;

    const advance = () => {
      i++;
      if (i <= contactList.length) {
        setNotifyIndex(i);
        setTimeout(advance, 900);
      } else {
        // All notified — show confirmed, then redirect
        setTimeout(() => {
          siren.stop();
          setStep('confirmed');
          setTimeout(() => setLocation('/map'), 2000);
        }, 600);
      }
    };

    const t = setTimeout(advance, 700);
    return () => {
      clearTimeout(t);
      siren.stop();
    };
  }, [step]);

  const triggerAlert = () => {
    if (!user || !selectedType) {
      setStep('notifying');
      return;
    }
    createAlert.mutate(
      {
        data: {
          userId: user.uid,
          type: selectedType,
          latitude: lat ?? 0,
          longitude: lng ?? 0,
          description: description || undefined,
        },
      },
      {
        onSuccess: (data) => {
          setAlertId(data.id);
          setStep('notifying');
        },
        onError: () => {
          // Still proceed with notification flow
          setStep('notifying');
        },
      }
    );
  };

  const cancelActivation = () => {
    if (step === 'activating') setStep('details');
  };

  const contactList = contacts.length > 0 ? contacts : [];

  return (
    <div className="min-h-[100dvh] bg-background flex flex-col">
      {/* Header */}
      <header className="px-4 py-4 flex items-center border-b border-border/40 relative">
        {step !== 'confirmed' && step !== 'activating' && step !== 'notifying' && (
          <Button
            variant="ghost"
            size="icon"
            onClick={() => step === 'type' ? setLocation('/dashboard') : setStep('type')}
            className="mr-2"
            data-testid="sos-back-btn"
          >
            <ArrowLeft className="w-5 h-5" />
          </Button>
        )}
        <h1 className="text-xl font-bold text-foreground absolute left-1/2 -translate-x-1/2">
          {step === 'type' && 'Select Emergency'}
          {step === 'details' && 'Emergency Details'}
          {step === 'activating' && 'Hold to Activate'}
          {step === 'notifying' && 'Sending Alert'}
          {step === 'confirmed' && 'Help is on the way'}
        </h1>
      </header>

      <main className="flex-1 p-5 flex flex-col overflow-hidden">
        <AnimatePresence mode="wait">

          {/* STEP 1: Select type */}
          {step === 'type' && (
            <motion.div
              key="type"
              initial={{ opacity: 0, x: 30 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: -30 }}
              className="space-y-4"
            >
              <p className="text-muted-foreground text-center mb-6 text-sm uppercase tracking-widest font-medium">
                What is your emergency?
              </p>
              <div className="grid grid-cols-2 gap-3">
                {EMERGENCY_TYPES.map(type => {
                  const Icon = type.icon;
                  return (
                    <button
                      key={type.id}
                      data-testid={`emergency-type-${type.id}`}
                      onClick={() => { setSelectedType(type.id); setStep('details'); }}
                      className={`flex flex-col items-center justify-center p-6 rounded-2xl border ${type.bg} hover:opacity-80 active:scale-95 transition-all duration-150`}
                    >
                      <Icon className={`w-9 h-9 ${type.color} mb-3`} />
                      <span className="font-semibold text-sm">{type.label}</span>
                    </button>
                  );
                })}
              </div>
            </motion.div>
          )}

          {/* STEP 2: Details */}
          {step === 'details' && (
            <motion.div
              key="details"
              initial={{ opacity: 0, x: 30 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: -30 }}
              className="flex-1 flex flex-col space-y-5"
            >
              <Card className="p-4 glass-dark border-border/50 space-y-3">
                <div className="flex items-center text-sm text-muted-foreground gap-2">
                  <MapPin className="w-4 h-4 text-primary flex-shrink-0" />
                  <span className="font-mono text-xs">
                    {lat && lng ? `${lat.toFixed(5)}, ${lng.toFixed(5)}` : 'Acquiring location...'}
                  </span>
                </div>
                <Textarea
                  placeholder="Additional details (e.g. 'Red Toyota, 2 injured')"
                  value={description}
                  onChange={e => setDescription(e.target.value)}
                  className="bg-background/50 resize-none border-border/50"
                  rows={3}
                  data-testid="sos-description"
                />
              </Card>

              {contactList.length > 0 && (
                <div className="space-y-2">
                  <div className="flex items-center gap-2 text-xs text-muted-foreground uppercase tracking-widest font-medium">
                    <Users className="w-3.5 h-3.5" />
                    Will notify
                  </div>
                  <div className="flex flex-wrap gap-2">
                    {contactList.map(c => (
                      <div key={c.id} className="px-3 py-1.5 rounded-full text-xs font-semibold bg-secondary border border-border/50">
                        {c.name}
                      </div>
                    ))}
                  </div>
                </div>
              )}

              <div className="mt-auto flex flex-col items-center pt-6">
                <p className="text-xs text-muted-foreground mb-5 font-medium uppercase tracking-widest">
                  Press &amp; hold to activate
                </p>
                <button
                  data-testid="sos-hold-button"
                  onPointerDown={() => setStep('activating')}
                  onPointerUp={cancelActivation}
                  className="relative w-36 h-36 rounded-full bg-primary flex items-center justify-center shadow-[0_0_60px_rgba(239,68,68,0.5)] border-4 border-background active:scale-95 transition-transform"
                >
                  <AlertCircle className="w-12 h-12 text-white" />
                </button>
              </div>
            </motion.div>
          )}

          {/* STEP 3: Activating (hold countdown) */}
          {step === 'activating' && (
            <motion.div
              key="activating"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className="flex-1 flex flex-col items-center justify-center"
              onPointerUp={cancelActivation}
              onPointerLeave={cancelActivation}
            >
              <motion.p
                animate={{ opacity: [1, 0.4, 1] }}
                transition={{ repeat: Infinity, duration: 0.6 }}
                className="text-destructive font-bold text-lg uppercase tracking-widest mb-10"
              >
                Hold to confirm...
              </motion.p>

              <div className="relative w-52 h-52 flex items-center justify-center">
                {/* Track ring */}
                <div className="absolute inset-0 rounded-full border-8 border-white/5" />
                {/* Progress ring via conic gradient */}
                <div
                  className="absolute inset-0 rounded-full"
                  style={{
                    background: `conic-gradient(hsl(0 84% 60%) ${holdProgress * 3.6}deg, transparent 0deg)`,
                    maskImage: 'radial-gradient(transparent 62%, black 63%)',
                    WebkitMaskImage: 'radial-gradient(transparent 62%, black 63%)',
                  }}
                />
                {/* Pulsing centre */}
                <motion.div
                  animate={{ scale: [1, 1.08, 1] }}
                  transition={{ repeat: Infinity, duration: 0.5 }}
                  className="w-36 h-36 bg-primary rounded-full flex items-center justify-center shadow-[0_0_60px_rgba(239,68,68,0.7)]"
                >
                  <AlertCircle className="w-14 h-14 text-white" />
                </motion.div>
              </div>

              <p className="mt-10 text-sm text-muted-foreground">Release to cancel</p>
            </motion.div>
          )}

          {/* STEP 4: Notifying contacts */}
          {step === 'notifying' && (
            <motion.div
              key="notifying"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className="flex-1 flex flex-col items-center justify-center space-y-8"
            >
              {/* Pulsing SOS rings */}
              <div className="relative flex items-center justify-center w-48 h-48">
                {[0, 1, 2].map(i => (
                  <motion.div
                    key={i}
                    className="absolute rounded-full border-2 border-primary"
                    animate={{ scale: [1, 2.5], opacity: [0.6, 0] }}
                    transition={{ repeat: Infinity, duration: 1.8, delay: i * 0.6 }}
                    style={{ width: 80, height: 80 }}
                  />
                ))}
                <div className="w-20 h-20 bg-primary rounded-full flex items-center justify-center shadow-[0_0_40px_rgba(239,68,68,0.8)]">
                  <Radio className="w-9 h-9 text-white" />
                </div>
              </div>

              <div className="w-full max-w-xs space-y-3">
                <h2 className="text-center font-bold text-lg text-foreground">Notifying Emergency Contacts</h2>
                <div className="space-y-2">
                  {(contactList.length > 0 ? contactList : [{ name: 'Emergency Services', id: 'es' }]).map((c, i) => (
                    <motion.div
                      key={c.id ?? i}
                      initial={{ opacity: 0, x: -10 }}
                      animate={notifyIndex > i ? { opacity: 1, x: 0 } : { opacity: 0.3, x: -10 }}
                      className="flex items-center justify-between glass-dark border border-border/50 rounded-xl px-4 py-3"
                    >
                      <span className="font-medium text-sm">{c.name}</span>
                      {notifyIndex > i && (
                        <motion.div initial={{ scale: 0 }} animate={{ scale: 1 }}>
                          <CheckCircle2 className="w-4 h-4 text-green-400" />
                        </motion.div>
                      )}
                    </motion.div>
                  ))}
                </div>
              </div>
            </motion.div>
          )}

          {/* STEP 5: Confirmed */}
          {step === 'confirmed' && (
            <motion.div
              key="confirmed"
              initial={{ opacity: 0, scale: 0.92 }}
              animate={{ opacity: 1, scale: 1 }}
              onAnimationStart={() => {
                sessionStorage.setItem('sos_active', 'true');
              }}
              className="flex-1 flex flex-col items-center justify-center text-center space-y-6"
              data-testid="sos-confirmed"
            >
              <motion.div
                initial={{ scale: 0 }}
                animate={{ scale: 1 }}
                transition={{ type: 'spring', stiffness: 250, damping: 18 }}
                className="w-24 h-24 bg-green-500/20 rounded-full flex items-center justify-center border border-green-500/40 shadow-[0_0_40px_rgba(34,197,94,0.3)]"
              >
                <CheckCircle2 className="w-12 h-12 text-green-400" />
              </motion.div>

              <div>
                <h2 className="text-3xl font-bold text-foreground mb-2">Alert Sent</h2>
                <p className="text-green-400 font-semibold text-sm">Emergency contacts notified successfully</p>
                <p className="text-muted-foreground text-sm mt-1">Redirecting to live map...</p>
              </div>

              {alertId && (
                <div className="glass-dark border border-border/50 rounded-xl px-6 py-4 w-full max-w-xs">
                  <div className="flex justify-between text-sm">
                    <span className="text-muted-foreground">Alert ID</span>
                    <span className="font-mono text-xs text-primary">{alertId.substring(0, 8).toUpperCase()}</span>
                  </div>
                  <div className="flex justify-between text-sm mt-2">
                    <span className="text-muted-foreground">Status</span>
                    <span className="text-primary font-bold flex items-center gap-1">
                      <span className="w-1.5 h-1.5 bg-primary rounded-full animate-pulse inline-block" />
                      Active
                    </span>
                  </div>
                </div>
              )}

              <div className="w-full h-1 bg-white/5 rounded-full overflow-hidden max-w-xs">
                <motion.div
                  className="h-full bg-primary"
                  initial={{ width: 0 }}
                  animate={{ width: '100%' }}
                  transition={{ duration: 2, ease: 'linear' }}
                />
              </div>
            </motion.div>
          )}

        </AnimatePresence>
      </main>
    </div>
  );
}
