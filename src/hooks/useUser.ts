import { useState, useEffect } from 'react';
import { 
  onAuthStateChanged, 
  User as FirebaseUser,
  signInWithPopup,
  signOut as firebaseSignOut,
  GoogleAuthProvider,
  getRedirectResult
} from 'firebase/auth';
import { 
  doc, 
  getDoc, 
  setDoc, 
  updateDoc, 
  serverTimestamp,
  writeBatch
} from 'firebase/firestore';
import { auth, db, handleFirestoreError } from '../firebase';
import { OperationType } from '../types';

const googleProvider = new GoogleAuthProvider();

export function useUser() {
  const [user, setUser] = useState<FirebaseUser | null>(null);
  const [credits, setCredits] = useState<number | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    // Check for errors from redirect flow
    getRedirectResult(auth).catch((err) => {
      console.error("Redirect auth error:", err);
      setError(err.message || "Sign-in could not be completed.");
    });

    const unsub = onAuthStateChanged(auth, async (firebaseUser) => {
      try {
        setUser(firebaseUser);
        if (firebaseUser) {
          await syncCredits(firebaseUser);
        } else {
          setCredits(null);
        }
      } catch (err) {
        console.error("Auth state sync error:", err);
      } finally {
        setIsLoading(false);
      }
    });

    return () => unsub();
  }, []);

  const syncCredits = async (firebaseUser: FirebaseUser) => {
    const userPath = `users/${firebaseUser.uid}`;
    try {
      const userDocRef = doc(db, 'users', firebaseUser.uid);
      const userDoc = await getDoc(userDocRef);
      
      if (userDoc.exists()) {
        const data = userDoc.data();
        setCredits(data.credits);
        // Sync display name if missing or outdated
        if (firebaseUser.displayName && data.displayName !== firebaseUser.displayName) {
          await updateDoc(userDocRef, {
            displayName: firebaseUser.displayName,
            updatedAt: serverTimestamp()
          });
        }
      } else {
        const initialCredits = 10;
        const displayName = firebaseUser.displayName || firebaseUser.email?.split('@')[0] || 'Neural Entity';
        await setDoc(userDocRef, {
          email: firebaseUser.email,
          displayName: displayName,
          credits: initialCredits,
          updatedAt: serverTimestamp()
        });
        setCredits(initialCredits);
      }
    } catch (err: any) {
      console.warn("Credits sync failed:", err);
      // If we are authenticated but credits fail, don't immediately set to 0
      // unless we're sure the document doesn't exist.
      // But for resilience, we'll keep it as null (loading state) for a bit longer
      // or set it if we have a cached value.
      
      try {
        handleFirestoreError(err, OperationType.GET, userPath);
      } catch (e) {
        // Silent catch
      }
    }
  };

  const deductCredit = async () => {
    if (!user || credits === null || credits <= 0) return false;
    const userPath = `users/${user.uid}`;
    try {
      const userDocRef = doc(db, 'users', user.uid);
      await updateDoc(userDocRef, {
        credits: credits - 1,
        updatedAt: serverTimestamp()
      });
      setCredits(prev => (prev !== null ? prev - 1 : null));
      return true;
    } catch (err: any) {
      handleFirestoreError(err, OperationType.UPDATE, userPath);
      return false;
    }
  };

  const rechargeCredits = async () => {
    if (!user || credits === null) return false;
    const userPath = `users/${user.uid}`;
    const rechargeId = `${user.uid}_${Date.now()}`;
    const rechargePath = `recharges/${rechargeId}`;
    try {
      const userDocRef = doc(db, 'users', user.uid);
      const rechargeRef = doc(db, 'recharges', rechargeId);
      const batch = writeBatch(db);

      batch.set(rechargeRef, {
        userId: user.uid,
        email: user.email,
        amount: 10,
        status: 'approved',
        txId: 'NEURAL_GIFT_' + Date.now().toString(36).toUpperCase(),
        createdAt: serverTimestamp()
      });

      batch.update(userDocRef, {
        credits: credits + 10,
        updatedAt: serverTimestamp()
      });
      
      await batch.commit();
      
      setCredits(prev => (prev !== null ? prev + 10 : 10));
      return true;
    } catch (err: any) {
      handleFirestoreError(err, OperationType.WRITE, rechargePath);
      return false;
    }
  };

  const signIn = async () => {
    // Standardizing on Popup as it is more reliable across AI Studio and Standalone environments
    // and avoids common session persistence issues with redirects in specialized runtimes.
    return signInWithPopup(auth, googleProvider);
  };
  const signOut = () => firebaseSignOut(auth);

  return {
    user,
    credits,
    isLoading,
    error,
    setError,
    signIn,
    signOut,
    deductCredit,
    rechargeCredits
  };
}
