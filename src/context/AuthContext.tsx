import React, { createContext, useContext, useEffect, useState } from 'react';
import { User, onAuthStateChanged } from 'firebase/auth';
import { doc, getDoc, setDoc } from 'firebase/firestore';
import { auth, db, signInWithGoogle, signOutUser, handleFirestoreError, OperationType } from '../firebase';
import { UserProfile } from '../types';

interface AuthContextType {
  user: User | null;
  userProfile: UserProfile | null;
  currency: string;
  setCurrency: (currency: string) => Promise<void>;
  monthlyGoal: number;
  setMonthlyGoal: (goal: number) => Promise<void>;
  loading: boolean;
  loginWithGoogle: () => Promise<void>;
  logout: () => Promise<void>;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [user, setUser] = useState<User | null>(null);
  const [userProfile, setUserProfile] = useState<UserProfile | null>(null);
  const [currency, setCurrencyState] = useState<string>(() => {
    return localStorage.getItem('earnings_tracker_currency') || 'INR';
  });
  const [monthlyGoal, setMonthlyGoalState] = useState<number>(() => {
    const saved = localStorage.getItem('earnings_tracker_monthly_goal');
    return saved ? Number(saved) : 100000;
  });
  const [loading, setLoading] = useState<boolean>(true);

  // Sync user profile from Firestore or initialize it
  const syncUserProfile = async (currentUser: User) => {
    const userDocPath = `users/${currentUser.uid}`;
    try {
      const userRef = doc(db, 'users', currentUser.uid);
      const snapshot = await getDoc(userRef);

      if (snapshot.exists()) {
        const data = snapshot.data() as UserProfile;
        setUserProfile(data);
        if (data.currency) {
          setCurrencyState(data.currency);
          localStorage.setItem('earnings_tracker_currency', data.currency);
        } else {
          setCurrencyState('INR');
        }
        if (data.monthlyGoal !== undefined && data.monthlyGoal !== null) {
          setMonthlyGoalState(data.monthlyGoal);
          localStorage.setItem('earnings_tracker_monthly_goal', data.monthlyGoal.toString());
        }
      } else {
        const initialProfile: UserProfile = {
          userId: currentUser.uid,
          email: currentUser.email || '',
          displayName: currentUser.displayName || 'User',
          photoURL: currentUser.photoURL || '',
          currency: 'INR',
          monthlyGoal: 100000,
          createdAt: new Date().toISOString(),
          updatedAt: new Date().toISOString(),
        };
        await setDoc(userRef, initialProfile);
        setUserProfile(initialProfile);
      }
    } catch (err) {
      handleFirestoreError(err, OperationType.WRITE, userDocPath);
    }
  };

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, async (currentUser) => {
      setUser(currentUser);
      if (currentUser) {
        try {
          await syncUserProfile(currentUser);
        } catch (e) {
          console.error('Failed to sync user profile:', e);
        }
      } else {
        setUserProfile(null);
      }
      setLoading(false);
    });

    return () => unsubscribe();
  }, []);

  const updateCurrency = async (newCurrency: string) => {
    setCurrencyState(newCurrency);
    localStorage.setItem('earnings_tracker_currency', newCurrency);

    if (user) {
      const userDocPath = `users/${user.uid}`;
      try {
        const userRef = doc(db, 'users', user.uid);
        await setDoc(
          userRef,
          {
            currency: newCurrency,
            updatedAt: new Date().toISOString(),
          },
          { merge: true }
        );
        setUserProfile((prev) => (prev ? { ...prev, currency: newCurrency } : null));
      } catch (err) {
        handleFirestoreError(err, OperationType.UPDATE, userDocPath);
      }
    }
  };

  const updateMonthlyGoal = async (newGoal: number) => {
    const validGoal = Math.max(0, newGoal);
    setMonthlyGoalState(validGoal);
    localStorage.setItem('earnings_tracker_monthly_goal', validGoal.toString());

    if (user) {
      const userDocPath = `users/${user.uid}`;
      try {
        const userRef = doc(db, 'users', user.uid);
        await setDoc(
          userRef,
          {
            monthlyGoal: validGoal,
            updatedAt: new Date().toISOString(),
          },
          { merge: true }
        );
        setUserProfile((prev) => (prev ? { ...prev, monthlyGoal: validGoal } : null));
      } catch (err) {
        handleFirestoreError(err, OperationType.UPDATE, userDocPath);
      }
    }
  };

  const login = async () => {
    setLoading(true);
    try {
      const loggedUser = await signInWithGoogle();
      if (loggedUser) {
        await syncUserProfile(loggedUser);
      }
    } finally {
      setLoading(false);
    }
  };

  const logout = async () => {
    setLoading(true);
    try {
      await signOutUser();
      setUser(null);
      setUserProfile(null);
    } finally {
      setLoading(false);
    }
  };

  return (
    <AuthContext.Provider
      value={{
        user,
        userProfile,
        currency,
        setCurrency: updateCurrency,
        monthlyGoal,
        setMonthlyGoal: updateMonthlyGoal,
        loading,
        loginWithGoogle: login,
        logout,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};
