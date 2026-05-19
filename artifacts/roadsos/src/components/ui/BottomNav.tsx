import { useLocation, Link } from 'wouter';
import { Shield, Map as MapIcon, AlertTriangle, UserCircle } from 'lucide-react';

export default function BottomNav() {
  const [location] = useLocation();

  return (
    <nav className="fixed bottom-0 left-0 right-0 glass-dark border-t border-white/10 px-6 py-4 flex justify-between items-center z-40 bg-[#0a0a0f]/90 backdrop-blur-md pb-safe">
      <Link href="/dashboard" className={`flex flex-col items-center gap-1 h-auto px-2 ${location === '/dashboard' ? 'text-primary' : 'text-muted-foreground hover:text-foreground'}`} data-testid="nav-dashboard">
        <Shield className="w-6 h-6" />
        <span className="text-[10px] font-medium">Home</span>
      </Link>
      <Link href="/map" className={`flex flex-col items-center gap-1 h-auto px-2 ${location === '/map' ? 'text-primary' : 'text-muted-foreground hover:text-foreground'}`} data-testid="nav-map">
        <MapIcon className="w-6 h-6" />
        <span className="text-[10px] font-medium">Map</span>
      </Link>
      
      <div className="relative -top-6">
        <Link href="/sos" className="flex flex-col items-center justify-center w-16 h-16 rounded-full bg-primary shadow-[0_0_20px_rgba(239,68,68,0.5)] border-4 border-[#0a0a0f] active:scale-95 transition-transform text-primary-foreground" data-testid="nav-sos">
          <AlertTriangle className="w-8 h-8 drop-shadow-md" />
        </Link>
      </div>

      <Link href="/profile" className={`flex flex-col items-center gap-1 h-auto px-2 ${location === '/profile' ? 'text-primary' : 'text-muted-foreground hover:text-foreground'}`} data-testid="nav-profile">
        <UserCircle className="w-6 h-6" />
        <span className="text-[10px] font-medium">Profile</span>
      </Link>
    </nav>
  );
}