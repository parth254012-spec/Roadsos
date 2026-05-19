import { useState, useEffect } from 'react';
import { useLocation } from 'wouter';
import { useAuth } from '@/context/AuthContext';
import { signInWithGoogle } from '@/services/auth';
import { motion } from 'framer-motion';
import { ShieldAlert } from 'lucide-react';
import GoogleSignInButton from '@/components/auth/GoogleSignInButton';
import { useToast } from '@/hooks/use-toast';

export default function AuthPage() {
  const [isSigningIn, setIsSigningIn] = useState(false);
  const [, setLocation] = useLocation();
  const { user, loading } = useAuth();
  const { toast } = useToast();

  // All hooks must be called before any early returns
  useEffect(() => {
    if (user) setLocation('/dashboard');
  }, [user]);

  if (loading) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <div className="w-8 h-8 border-4 border-primary border-t-transparent rounded-full animate-spin" />
      </div>
    );
  }

  if (user) return null;

  const handleSignIn = async () => {
    try {
      setIsSigningIn(true);
      await signInWithGoogle();
    } catch (error: any) {
      console.error('Sign in error:', error);
      if (error?.code !== 'auth/popup-closed-by-user' && error?.code !== 'auth/cancelled-popup-request') {
        toast({
          variant: 'destructive',
          title: 'Authentication Failed',
          description: error.message || 'Could not sign in with Google',
        });
      }
      setIsSigningIn(false);
    }
  };

  return (
    <div className="min-h-screen bg-background flex flex-col items-center justify-center relative overflow-hidden">
      {/* Background Radar Animation */}
      <div className="absolute inset-0 flex items-center justify-center opacity-20 pointer-events-none">
        {[0, 1, 2].map(i => (
          <motion.div
            key={i}
            animate={{ scale: [1, 2.5, 3.5], opacity: [0.6, 0.2, 0] }}
            transition={{ duration: 3, repeat: Infinity, ease: 'easeOut', delay: i * 1 }}
            className="absolute w-64 h-64 rounded-full border border-primary"
          />
        ))}
      </div>

      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5 }}
        className="z-10 w-full max-w-md px-6"
      >
        <div className="glass-dark rounded-2xl border border-white/10 p-8 flex flex-col items-center text-center">
          <motion.div
            animate={{ scale: [1, 1.05, 1] }}
            transition={{ repeat: Infinity, duration: 2.5 }}
            className="w-20 h-20 bg-primary/10 rounded-full flex items-center justify-center mb-6 border border-primary/30 shadow-[0_0_30px_rgba(239,68,68,0.2)]"
          >
            <ShieldAlert className="w-10 h-10 text-primary" />
          </motion.div>

          <h1 className="text-4xl font-bold mb-2 tracking-tight text-foreground">RoadSoS</h1>
          <p className="text-muted-foreground mb-10 text-base">Your Emergency Guardian on Every Road</p>

          <div className="w-full">
            <GoogleSignInButton
              onClick={handleSignIn}
              disabled={isSigningIn}
              data-testid="google-signin-btn"
            />
          </div>

          {isSigningIn && (
            <p className="text-xs text-muted-foreground mt-4 animate-pulse">
              Opening sign-in window...
            </p>
          )}
        </div>
      </motion.div>
    </div>
  );
}
