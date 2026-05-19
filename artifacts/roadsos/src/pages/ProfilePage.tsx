import { useState } from 'react';
import { useAuth } from '@/context/AuthContext';
import { signOut } from '@/services/auth';
import { useEmergencyContacts } from '@/hooks/useEmergencyContacts';
import { useLocation as useGeoLocation } from '@/hooks/useLocation';
import { UserCircle, LogOut, ShieldCheck, Plus, Trash2, MapPin, Bot } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { useToast } from '@/hooks/use-toast';
import { Skeleton } from '@/components/ui/skeleton';
import BottomNav from '@/components/ui/BottomNav';
import { motion, AnimatePresence } from 'framer-motion';

export default function ProfilePage() {
  const { user } = useAuth();
  const { contacts, loading: contactsLoading, addContact, removeContact } = useEmergencyContacts(user?.uid);
  const geoLocation = useGeoLocation();
  const { toast } = useToast();
  
  const [showAddContact, setShowAddContact] = useState(false);
  const [newContact, setNewContact] = useState({ name: '', phone: '', relation: 'Family' });
  const [addingContact, setAddingContact] = useState(false);

  const handleSignOut = async () => {
    await signOut();
    window.location.href = '/';
  };

  const handleAddContact = async () => {
    if (!user?.uid || !newContact.name || !newContact.phone) return;
    try {
      setAddingContact(true);
      await addContact({
        userId: user.uid,
        name: newContact.name,
        phone: newContact.phone,
        relation: newContact.relation
      });
      setShowAddContact(false);
      setNewContact({ name: '', phone: '', relation: 'Family' });
      toast({ title: "Contact added", description: "Emergency contact saved successfully." });
    } catch (err) {
      toast({ title: "Error", description: "Failed to add contact.", variant: "destructive" });
    } finally {
      setAddingContact(false);
    }
  };

  const handleDeleteContact = async (id: string) => {
    try {
      await removeContact(id);
      toast({ title: "Contact removed" });
    } catch (err) {
      toast({ title: "Error", description: "Failed to remove contact.", variant: "destructive" });
    }
  };

  return (
    <div className="min-h-[100dvh] bg-[#0a0a0f] pb-24">
      <main className="p-5 max-w-md mx-auto space-y-6">
        
        {/* Hero Section */}
        <div className="flex flex-col items-center pt-8 pb-4 text-center relative">
          <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-32 h-32 bg-primary/20 rounded-full blur-2xl pointer-events-none"></div>
          
          <div className="w-24 h-24 rounded-full overflow-hidden bg-secondary border-2 border-primary/50 relative z-10 mb-4 shadow-[0_0_15px_rgba(239,68,68,0.3)]">
            {user?.photoURL ? (
              <img src={user.photoURL} alt={user.displayName || "User"} className="w-full h-full object-cover" />
            ) : (
              <UserCircle className="w-full h-full text-muted-foreground p-2" />
            )}
          </div>
          
          <div className="flex items-center justify-center gap-2 mb-1">
            <h2 className="text-2xl font-bold text-foreground tracking-tight">{user?.displayName || "Driver"}</h2>
            <ShieldCheck className="w-5 h-5 text-green-500" />
          </div>
          <p className="text-muted-foreground text-sm font-medium">{user?.email}</p>
          
          <div className="mt-4 px-3 py-1 rounded-full bg-green-500/10 border border-green-500/20 text-green-500 text-xs font-bold uppercase tracking-widest flex items-center gap-1.5">
            Verified Driver
          </div>
        </div>

        {/* Emergency Contacts */}
        <div className="space-y-4">
          <div className="flex items-center justify-between px-1">
            <h3 className="text-xs font-bold uppercase tracking-widest text-muted-foreground">Emergency Contacts ({contacts.length}/3)</h3>
            {contacts.length < 3 && !showAddContact && (
              <button onClick={() => setShowAddContact(true)} className="text-primary hover:text-primary/80 active:scale-95 transition-transform" data-testid="btn-add-contact">
                <Plus className="w-5 h-5" />
              </button>
            )}
          </div>

          <div className="space-y-3">
            {contactsLoading ? (
              <>
                <Skeleton className="h-16 w-full rounded-2xl glass-dark border border-white/10" />
                <Skeleton className="h-16 w-full rounded-2xl glass-dark border border-white/10" />
              </>
            ) : (
              <AnimatePresence>
                {contacts.map((contact) => (
                  <motion.div 
                    key={contact.id}
                    initial={{ opacity: 0, y: 10 }}
                    animate={{ opacity: 1, y: 0 }}
                    exit={{ opacity: 0, scale: 0.95 }}
                    className="glass-dark border border-white/10 rounded-2xl p-4 flex items-center justify-between"
                  >
                    <div className="flex items-center gap-3">
                      <div className="w-10 h-10 rounded-full bg-secondary flex items-center justify-center text-muted-foreground font-bold text-sm">
                        {contact.name.substring(0, 2).toUpperCase()}
                      </div>
                      <div>
                        <p className="font-semibold text-sm">{contact.name}</p>
                        <p className="text-xs text-muted-foreground">{contact.phone}</p>
                      </div>
                    </div>
                    <div className="flex items-center gap-3">
                      <span className="text-[10px] font-bold uppercase tracking-widest text-muted-foreground bg-secondary px-2 py-1 rounded-md">{contact.relation}</span>
                      <button onClick={() => handleDeleteContact(contact.id!)} className="text-muted-foreground hover:text-destructive active:scale-95 transition-transform p-2">
                        <Trash2 className="w-4 h-4" />
                      </button>
                    </div>
                  </motion.div>
                ))}
              </AnimatePresence>
            )}

            {showAddContact && (
              <motion.div initial={{ opacity: 0, height: 0 }} animate={{ opacity: 1, height: 'auto' }} className="glass-dark border border-primary/30 rounded-2xl p-4 space-y-3">
                <Input placeholder="Name" value={newContact.name} onChange={e => setNewContact({...newContact, name: e.target.value})} className="bg-[#0a0a0f]" />
                <Input placeholder="Phone Number" value={newContact.phone} onChange={e => setNewContact({...newContact, phone: e.target.value})} className="bg-[#0a0a0f]" />
                <select 
                  className="flex h-10 w-full rounded-md border border-input bg-[#0a0a0f] px-3 py-2 text-sm ring-offset-background file:border-0 file:bg-transparent file:text-sm file:font-medium placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50"
                  value={newContact.relation}
                  onChange={e => setNewContact({...newContact, relation: e.target.value})}
                >
                  <option>Family</option>
                  <option>Friend</option>
                  <option>Partner</option>
                  <option>Other</option>
                </select>
                <div className="flex gap-2 pt-2">
                  <Button variant="outline" className="flex-1" onClick={() => setShowAddContact(false)}>Cancel</Button>
                  <Button className="flex-1" onClick={handleAddContact} disabled={!newContact.name || !newContact.phone || addingContact}>
                    Save
                  </Button>
                </div>
              </motion.div>
            )}

            {!contactsLoading && contacts.length === 0 && !showAddContact && (
              <div className="text-center py-6 glass-dark border border-white/5 rounded-2xl border-dashed">
                <p className="text-sm text-muted-foreground mb-3">No emergency contacts set.</p>
                <Button variant="outline" size="sm" onClick={() => setShowAddContact(true)} className="rounded-full">Add First Contact</Button>
              </div>
            )}
          </div>
        </div>

        {/* App Status */}
        <div className="space-y-3 pt-2">
          <h3 className="text-xs font-bold uppercase tracking-widest text-muted-foreground px-1">System Status</h3>
          <div className="glass-dark border border-white/10 rounded-2xl overflow-hidden divide-y divide-white/5">
            <div className="p-4 flex items-center justify-between">
              <div className="flex items-center gap-3">
                <MapPin className="w-5 h-5 text-muted-foreground" />
                <span className="text-sm font-medium">Location Services</span>
              </div>
              <div className="flex items-center gap-1.5">
                <div className={`w-2 h-2 rounded-full ${geoLocation.lat ? 'bg-green-500' : 'bg-red-500'}`}></div>
                <span className="text-xs font-semibold text-muted-foreground">{geoLocation.lat ? 'Active' : 'Unavailable'}</span>
              </div>
            </div>
            <div className="p-4 flex items-center justify-between">
              <div className="flex items-center gap-3">
                <Bot className="w-5 h-5 text-muted-foreground" />
                <span className="text-sm font-medium">AI Advisor</span>
              </div>
              <div className="flex items-center gap-1.5">
                <div className="w-2 h-2 rounded-full bg-green-500"></div>
                <span className="text-xs font-semibold text-muted-foreground">Connected</span>
              </div>
            </div>
          </div>
        </div>

        {/* Danger Zone */}
        <div className="pt-6">
          <Button variant="destructive" className="w-full py-6 rounded-2xl font-bold tracking-wide active:scale-95 transition-transform" onClick={handleSignOut} data-testid="btn-signout">
            <LogOut className="w-5 h-5 mr-2" />
            Sign Out
          </Button>
        </div>
      </main>

      <BottomNav />
    </div>
  );
}