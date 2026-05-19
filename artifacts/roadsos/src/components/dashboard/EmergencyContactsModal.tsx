import { useState } from 'react';
import { useAuth } from '@/context/AuthContext';
import { useEmergencyContacts } from '@/hooks/useEmergencyContacts';
import { useToast } from '@/hooks/use-toast';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { UserPlus, Trash2 } from 'lucide-react';

interface ContactForm {
  name: string;
  phone: string;
  relation: string;
}

export default function EmergencyContactsModal() {
  const { user, showContactsModal, setShowContactsModal } = useAuth();
  const { contacts, addContact, removeContact, loading } = useEmergencyContacts(user?.uid);
  const { toast } = useToast();
  
  const [newContact, setNewContact] = useState<ContactForm>({ name: '', phone: '', relation: 'Family' });
  const [isSaving, setIsSaving] = useState(false);

  const handleAdd = async () => {
    if (!newContact.name || !newContact.phone) {
      toast({ variant: "destructive", title: "Missing fields", description: "Name and phone are required" });
      return;
    }
    if (!user) return;

    try {
      setIsSaving(true);
      await addContact({
        userId: user.uid,
        name: newContact.name,
        phone: newContact.phone,
        relation: newContact.relation,
      });
      setNewContact({ name: '', phone: '', relation: 'Family' });
      toast({ title: "Contact added", description: `${newContact.name} has been added.` });
    } catch (err) {
      toast({ variant: "destructive", title: "Error", description: "Could not save contact" });
    } finally {
      setIsSaving(false);
    }
  };

  const handleClose = () => {
    if (contacts.length === 0) {
      toast({ variant: "destructive", title: "Action required", description: "Please add at least one emergency contact." });
      return;
    }
    setShowContactsModal(false);
  };

  return (
    <Dialog open={showContactsModal} onOpenChange={(open) => !open && handleClose()}>
      <DialogContent className="glass-dark border-border sm:max-w-md max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="text-2xl text-foreground">Set Up Emergency Contacts</DialogTitle>
          <DialogDescription className="text-muted-foreground">
            These people will be notified when you trigger an SOS. Please add at least one.
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-6 py-4">
          <div className="space-y-4 bg-black/20 p-4 rounded-lg border border-border/50">
            <h3 className="font-medium text-sm text-muted-foreground uppercase tracking-wider">Add New Contact</h3>
            <div className="space-y-3">
              <div className="space-y-1">
                <Label htmlFor="name">Name</Label>
                <Input id="name" value={newContact.name} onChange={e => setNewContact({...newContact, name: e.target.value})} className="bg-background/50 border-border" placeholder="e.g. Jane Doe" />
              </div>
              <div className="space-y-1">
                <Label htmlFor="phone">Phone</Label>
                <Input id="phone" value={newContact.phone} onChange={e => setNewContact({...newContact, phone: e.target.value})} className="bg-background/50 border-border" placeholder="+1 (555) 000-0000" type="tel" />
              </div>
              <div className="space-y-1">
                <Label htmlFor="relation">Relation</Label>
                <Select value={newContact.relation} onValueChange={v => setNewContact({...newContact, relation: v})}>
                  <SelectTrigger className="bg-background/50 border-border">
                    <SelectValue placeholder="Select relation" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="Family">Family</SelectItem>
                    <SelectItem value="Friend">Friend</SelectItem>
                    <SelectItem value="Colleague">Colleague</SelectItem>
                    <SelectItem value="Other">Other</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              <Button onClick={handleAdd} disabled={isSaving || contacts.length >= 3} className="w-full mt-2" variant="secondary">
                <UserPlus className="w-4 h-4 mr-2" /> Add Contact
              </Button>
              {contacts.length >= 3 && <p className="text-xs text-muted-foreground text-center">Maximum 3 contacts allowed</p>}
            </div>
          </div>

          <div className="space-y-3">
            <h3 className="font-medium text-sm text-muted-foreground uppercase tracking-wider">Current Contacts ({contacts.length}/3)</h3>
            {loading ? (
              <div className="flex justify-center p-4"><div className="w-6 h-6 border-2 border-primary border-t-transparent rounded-full animate-spin"></div></div>
            ) : contacts.length === 0 ? (
              <p className="text-sm text-muted-foreground text-center py-4 border border-dashed border-border rounded-lg">No contacts added yet</p>
            ) : (
              <div className="space-y-2">
                {contacts.map(c => (
                  <div key={c.id} className="flex items-center justify-between p-3 rounded-lg bg-background/50 border border-border">
                    <div>
                      <p className="font-medium">{c.name}</p>
                      <p className="text-xs text-muted-foreground">{c.phone} • {c.relation}</p>
                    </div>
                    <Button variant="ghost" size="icon" onClick={() => c.id && removeContact(c.id)} className="text-destructive hover:text-destructive hover:bg-destructive/10">
                      <Trash2 className="w-4 h-4" />
                    </Button>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>

        <Button onClick={handleClose} className="w-full" disabled={contacts.length === 0}>
          Continue to Dashboard
        </Button>
      </DialogContent>
    </Dialog>
  );
}
