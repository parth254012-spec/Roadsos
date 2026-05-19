import { useState, useEffect } from 'react';
import { collection, query, where, getDocs, addDoc, deleteDoc, doc } from 'firebase/firestore';
import { db } from '@/services/firebase';

export interface EmergencyContact {
  id?: string;
  userId: string;
  name: string;
  phone: string;
  relation: string;
  photoUrl?: string;
}

export function useEmergencyContacts(userId: string | undefined) {
  const [contacts, setContacts] = useState<EmergencyContact[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (!userId) {
      setContacts([]);
      setLoading(false);
      return;
    }

    const fetchContacts = async () => {
      try {
        setLoading(true);
        const q = query(collection(db, "emergencyContacts"), where("userId", "==", userId));
        const querySnapshot = await getDocs(q);
        const fetchedContacts: EmergencyContact[] = [];
        querySnapshot.forEach((doc) => {
          fetchedContacts.push({ id: doc.id, ...doc.data() } as EmergencyContact);
        });
        setContacts(fetchedContacts);
      } catch (err: any) {
        console.error("Error fetching contacts:", err);
        setError(err.message);
      } finally {
        setLoading(false);
      }
    };

    fetchContacts();
  }, [userId]);

  const addContact = async (contact: Omit<EmergencyContact, 'id'>) => {
    try {
      const docRef = await addDoc(collection(db, "emergencyContacts"), contact);
      setContacts(prev => [...prev, { id: docRef.id, ...contact }]);
      return docRef.id;
    } catch (err: any) {
      console.error("Error adding contact:", err);
      throw err;
    }
  };

  const removeContact = async (id: string) => {
    try {
      await deleteDoc(doc(db, "emergencyContacts", id));
      setContacts(prev => prev.filter(c => c.id !== id));
    } catch (err: any) {
      console.error("Error deleting contact:", err);
      throw err;
    }
  };

  return { contacts, loading, error, addContact, removeContact };
}
