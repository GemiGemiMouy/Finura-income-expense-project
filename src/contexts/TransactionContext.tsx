import React, { createContext, useContext, useEffect, useState } from 'react';
import { Transaction, TransactionInput } from '../types';
import {
  addTransaction as addTransactionService,
  updateTransaction as updateTransactionService,
  deleteTransaction as deleteTransactionService,
  subscribeToTransactions,
  getTransactionsByDateRange
} from '../services/transactionService';
import { useAuth } from './AuthContext';

import { DEFAULT_DAILY_LIMIT, getUserSettings, updateUserSettings } from '../services/userService';

type TransactionContextType = {
  transactions: Transaction[];
  loading: boolean;
  dailyLimit: number; // Add dailyLimit to context type
  addTransaction: (transaction: Omit<TransactionInput, 'userId'>) => Promise<void>;
  updateTransaction: (id: string, updates: Partial<TransactionInput>) => Promise<void>;
  deleteTransaction: (id: string) => Promise<void>;
  updateDailyLimit: (newLimit: number) => Promise<void>; // Add updateDailyLimit to context type
  getTransactionsByDate: (startDate: Date, endDate: Date) => Promise<Transaction[]>;
};

const TransactionContext = createContext<TransactionContextType | undefined>(undefined);

export function useTransactions() {
  const context = useContext(TransactionContext);
  if (!context) {
    throw new Error('useTransactions must be used within a TransactionProvider');
  }
  return context;
}

export function TransactionProvider({ children }: { children: React.ReactNode }) {
  const [transactions, setTransactions] = useState<Transaction[]>([]);
  const [dailyLimit, setDailyLimit] = useState<number>(DEFAULT_DAILY_LIMIT); // Initialize dailyLimit
  const [loading, setLoading] = useState(true);
  const { currentUser } = useAuth();

  // Subscribe to real-time updates and fetch settings
  useEffect(() => {
    if (!currentUser) {
      setTransactions([]);
      setDailyLimit(DEFAULT_DAILY_LIMIT);
      setLoading(false);
      return;
    }

    setLoading(true);

    const initData = async () => {
      // Fetch user settings
      const settings = await getUserSettings(currentUser.uid);
      setDailyLimit(settings.dailyLimit);
    };

    initData();

    const unsubscribe = subscribeToTransactions(
      currentUser.uid,
      (updatedTransactions) => {
        setTransactions(updatedTransactions);
        setLoading(false);
      }
    );

    return () => unsubscribe();
  }, [currentUser]);

  const addTransaction = async (transaction: Omit<TransactionInput, 'userId'>) => {
    if (!currentUser) throw new Error('User not authenticated');
    await addTransactionService(currentUser.uid, transaction);
  };

  const updateTransaction = async (id: string, updates: Partial<Omit<TransactionInput, 'userId'>>) => {
    if (!currentUser) throw new Error('User not authenticated');
    const processedUpdates = { ...updates };

    // Convert Date to ISO string if it's a Date object
    if (updates.date && updates.date instanceof Date) {
      processedUpdates.date = updates.date.toISOString();
    }

    await updateTransactionService(currentUser.uid, id, processedUpdates as any);
  };

  const deleteTransaction = async (id: string) => {
    if (!currentUser) throw new Error('User not authenticated');
    await deleteTransactionService(currentUser.uid, id);
  };

  const updateDailyLimit = async (newLimit: number) => {
    if (!currentUser) throw new Error('User not authenticated');
    await updateUserSettings(currentUser.uid, { dailyLimit: newLimit });
    setDailyLimit(newLimit);
  };

  const getTransactionsByDate = async (startDate: Date, endDate: Date) => {
    if (!currentUser) throw new Error('User not authenticated');
    return await getTransactionsByDateRange(currentUser.uid, startDate, endDate);
  };

  const value = {
    transactions,
    loading,
    dailyLimit,
    addTransaction,
    updateTransaction,
    deleteTransaction,
    updateDailyLimit,
    getTransactionsByDate,
  };

  return (
    <TransactionContext.Provider value={value}>
      {children}
    </TransactionContext.Provider>
  );
}
