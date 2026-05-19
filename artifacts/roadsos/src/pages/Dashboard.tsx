import { useAuth } from '@/context/AuthContext';
import { useEmergencyContacts } from '@/hooks/useEmergencyContacts';
import { useLocation as useWouterLocation, Link } from 'wouter';
import { useLocation } from '@/hooks/useLocation';
import { useEffect, useState } from 'react';
import { getNearbyServices, NearbyService } from '@/services/nearbyServices';
import { useGetDashboardSummary, useListIncidents } from '@workspace/api-client-react';
import EmergencyContactsModal from '@/components/dashboard/EmergencyContactsModal';
import SOSButton from '@/components/dashboard/SOSButton';
import AIAssistant from '@/components/ai/AIAssistant';
import BottomNav from '@/components/ui/BottomNav';
import { Activity, Shield, Users, MapPin, Map as MapIcon, UserCircle, AlertCircle, Clock, Plus } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Skeleton } from '@/components/ui/skeleton';

export default function Dashboard() {
  const { user } = useAuth();
  const { contacts, loading: contactsLoading } = useEmergencyContacts(user?.uid);
  const [, setLocation] = useWouterLocation();
  const { lat, lng, loading: locationLoading } = useLocation();
  const [nearbyServices, setNearbyServices] = useState<NearbyService[]>([]);
  const [servicesLoading, setServicesLoading] = useState(true);

  const { data: summary, isLoading: summaryLoading } = useGetDashboardSummary(
    { userId: user?.uid || '' },
    { query: { enabled: !!user?.uid, retry: false, queryKey: ['dashboard-summary', user?.uid] } }
  );

  const { data: incidents, isLoading: incidentsLoading } = useListIncidents(
    {},
    { query: { retry: false, queryKey: ['incidents'] } }
  );

  useEffect(() => {
    if (lat && lng) {
      setServicesLoading(true);
      getNearbyServices(lat, lng, 3000)
        .then(services => setNearbyServices(services.slice(0, 3)))
        .finally(() => setServicesLoading(false));
    }
  }, [lat, lng]);

  const getSeverityColor = (severity: string) => {
    switch (severity?.toLowerCase()) {
      case 'high': return 'text-red-500 bg-red-500/10 border-red-500/20';
      case 'medium': return 'text-orange-500 bg-orange-500/10 border-orange-500/20';
      case 'low': return 'text-yellow-500 bg-yellow-500/10 border-yellow-500/20';
      default: return 'text-primary bg-primary/10 border-primary/20';
    }
  };

  return (
    <div className="min-h-[100dvh] bg-[#0a0a0f] pb-24">
      <EmergencyContactsModal />
      
      {/* Header */}
      <header className="px-5 py-4 flex items-center justify-between glass sticky top-0 z-40 border-b border-white/10 bg-[#0a0a0f]/80 backdrop-blur-md">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-full overflow-hidden bg-secondary border border-white/10">
            {user?.photoURL ? <img src={user.photoURL} alt="User" className="w-full h-full object-cover" /> : <UserCircle className="w-full h-full text-muted-foreground p-1" />}
          </div>
          <div>
            <h2 className="text-xs text-muted-foreground font-bold uppercase tracking-widest">Command Center</h2>
            <p className="text-foreground font-bold text-sm">{user?.displayName || 'Driver'}</p>
          </div>
        </div>
        <div className="flex items-center gap-2 px-3 py-1.5 rounded-full bg-green-500/10 border border-green-500/20 text-green-500 text-[10px] font-bold uppercase tracking-widest">
          <div className="w-2 h-2 rounded-full bg-green-500 animate-pulse"></div>
          System Ready
        </div>
      </header>

      <main className="p-5 max-w-md mx-auto space-y-8">
        
        {/* Big SOS Button */}
        <SOSButton />

        {/* Quick Stats */}
        <div className="grid grid-cols-3 gap-3">
          <div className="glass-dark rounded-2xl p-4 flex flex-col items-center justify-center text-center border border-white/10">
            <Activity className="w-5 h-5 text-primary mb-2" />
            {summaryLoading ? <Skeleton className="h-8 w-12 rounded" /> : <span className="text-2xl font-bold">{summary?.activeAlerts || 0}</span>}
            <span className="text-[10px] font-bold text-muted-foreground uppercase tracking-widest mt-1">Alerts</span>
          </div>
          <div className="glass-dark rounded-2xl p-4 flex flex-col items-center justify-center text-center border border-white/10">
            <Users className="w-5 h-5 text-blue-500 mb-2" />
            {contactsLoading ? <Skeleton className="h-8 w-12 rounded" /> : <span className="text-2xl font-bold">{contacts.length}</span>}
            <span className="text-[10px] font-bold text-muted-foreground uppercase tracking-widest mt-1">Contacts</span>
          </div>
          <div className="glass-dark rounded-2xl p-4 flex flex-col items-center justify-center text-center border border-white/10">
            <Shield className="w-5 h-5 text-emerald-500 mb-2" />
            {(locationLoading || servicesLoading) ? <Skeleton className="h-8 w-12 rounded" /> : <span className="text-2xl font-bold">{nearbyServices.length > 0 ? nearbyServices.length + '+' : '-'}</span>}
            <span className="text-[10px] font-bold text-muted-foreground uppercase tracking-widest mt-1">Services</span>
          </div>
        </div>

        {/* Contacts Preview */}
        <div className="space-y-3">
          <h3 className="text-xs font-bold uppercase tracking-widest text-muted-foreground px-1">Emergency Team</h3>
          <div className="glass-dark rounded-2xl border border-white/10 p-4">
            {contactsLoading ? (
               <div className="flex gap-4">
                 {[1, 2, 3].map(i => <Skeleton key={i} className="w-12 h-12 rounded-full" />)}
               </div>
            ) : contacts.length === 0 ? (
               <div className="flex items-center justify-between">
                 <p className="text-sm text-muted-foreground">No contacts configured</p>
                 <Link href="/profile" className="flex items-center justify-center w-10 h-10 rounded-full bg-primary/20 text-primary border border-primary/30 active:scale-95 transition-transform">
                   <Plus className="w-5 h-5" />
                 </Link>
               </div>
            ) : (
               <div className="flex gap-4">
                 {contacts.slice(0, 3).map(contact => (
                   <div key={contact.id} className="flex flex-col items-center gap-1">
                     <div className="w-12 h-12 rounded-full bg-secondary border border-white/10 flex items-center justify-center text-muted-foreground font-bold text-sm">
                       {contact.name.substring(0, 2).toUpperCase()}
                     </div>
                     <span className="text-[10px] font-medium text-foreground truncate w-14 text-center">{contact.name.split(' ')[0]}</span>
                   </div>
                 ))}
                 {contacts.length < 3 && (
                   <Link href="/profile" className="w-12 h-12 rounded-full bg-secondary/50 border border-white/10 border-dashed flex items-center justify-center text-muted-foreground hover:text-foreground active:scale-95 transition-all">
                     <Plus className="w-5 h-5" />
                   </Link>
                 )}
               </div>
            )}
          </div>
        </div>

        {/* AI Assistant */}
        <AIAssistant />

        {/* Recent Incidents */}
        <div className="space-y-3">
          <div className="flex items-center justify-between px-1">
            <h3 className="text-xs font-bold uppercase tracking-widest text-muted-foreground flex items-center gap-2"><AlertCircle className="w-4 h-4 text-primary" /> Area Alerts</h3>
          </div>
          
          <div className="space-y-2">
            {incidentsLoading ? (
              [1, 2].map(i => <Skeleton key={i} className="h-16 w-full rounded-2xl glass-dark border border-white/10" />)
            ) : incidents && incidents.length > 0 ? (
              (Array.isArray(incidents) ? incidents : []).map(incident => (
                <div key={incident.id} className="glass-dark rounded-2xl border border-white/10 p-3 flex items-center gap-3">
                  <div className={`shrink-0 px-2 py-1 rounded-md border text-[10px] font-bold uppercase tracking-widest ${getSeverityColor(incident.severity)}`}>
                    {incident.type}
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="text-sm font-medium text-foreground truncate">{incident.description}</p>
                    <div className="flex items-center gap-1 text-[10px] text-muted-foreground mt-0.5">
                      <Clock className="w-3 h-3" />
                      <span>{new Date(incident.createdAt).toLocaleTimeString([], {hour: '2-digit', minute:'2-digit'})}</span>
                    </div>
                  </div>
                </div>
              ))
            ) : (
              <div className="text-sm text-muted-foreground p-4 text-center glass-dark rounded-2xl border border-white/10 border-dashed">
                No recent incidents nearby
              </div>
            )}
          </div>
        </div>

        {/* Nearby Services Preview */}
        <div className="space-y-3 pb-4">
          <div className="flex items-center justify-between px-1">
            <h3 className="text-xs font-bold uppercase tracking-widest text-muted-foreground flex items-center gap-2"><MapPin className="w-4 h-4 text-primary" /> Services</h3>
            <Link href="/map" className="text-[10px] text-primary hover:underline font-bold uppercase tracking-widest">View All</Link>
          </div>
          
          <div className="glass-dark rounded-2xl border border-white/10 p-2 space-y-1">
            {(locationLoading || servicesLoading) ? (
              [1, 2, 3].map(i => <Skeleton key={i} className="h-14 w-full rounded-xl bg-secondary/30" />)
            ) : !lat || !lng ? (
              <p className="text-sm text-muted-foreground p-4 text-center">Locating...</p>
            ) : nearbyServices.length === 0 ? (
              <p className="text-sm text-muted-foreground p-4 text-center">No services found nearby</p>
            ) : (
              nearbyServices.map(service => (
                <div key={service.id} className="flex items-center justify-between p-3 rounded-xl bg-secondary/30 hover:bg-secondary/50 transition-colors">
                  <div className="flex items-center gap-3">
                    <div className="w-8 h-8 rounded-full bg-[#0a0a0f] flex items-center justify-center border border-white/5">
                      <Shield className="w-4 h-4 text-muted-foreground" />
                    </div>
                    <div>
                      <p className="font-semibold text-sm line-clamp-1">{service.name}</p>
                      <p className="text-[10px] font-bold text-muted-foreground uppercase tracking-widest">{service.type}</p>
                    </div>
                  </div>
                  <div className="text-xs font-bold text-primary">
                    {service.distance ? `${service.distance.toFixed(1)} km` : ''}
                  </div>
                </div>
              ))
            )}
          </div>
        </div>

      </main>

      <BottomNav />
    </div>
  );
}