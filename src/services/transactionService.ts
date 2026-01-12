// src/services/transactionService.ts
import {
  collection,
  addDoc,
  updateDoc,
  deleteDoc,
  doc,
  onSnapshot,
  query,
  where,
  orderBy,
  serverTimestamp,
  Timestamp,
  getDocs
} from 'firebase/firestore';
import { db } from '../firebase/config';
import { Transaction, TransactionInput } from '../types';

// Add a new transaction
export const addTransaction = async (uid: string, transaction: Omit<TransactionInput, "userId">): Promise<void> => {
  try {
    await addDoc(collection(db, 'users', uid, 'transactions'), {
      ...transaction,
      date: transaction.date instanceof Timestamp ? transaction.date : Timestamp.fromDate(new Date(transaction.date)),
      createdAt: serverTimestamp()
    });
  } catch (error) {
    console.error('Error adding transaction:', error);
    throw error;
  }
};

// Get all transactions for a user
export const subscribeToTransactions = (
  userId: string,
  callback: (transactions: Transaction[]) => void
) => {
  const transactionsRef = collection(db, 'users', userId, 'transactions');
  const q = query(transactionsRef, orderBy('date', 'desc'));

  return onSnapshot(q, (querySnapshot) => {
    const transactions = querySnapshot.docs.map(doc => {
      const data = doc.data();
      return {
        id: doc.id,
        ...data,
        date: data.date?.toDate ? data.date.toDate().toISOString() : data.date,
        createdAt: data.createdAt?.toDate ? data.createdAt.toDate() : data.createdAt
      } as Transaction;
    });
    callback(transactions);
  });
};

// Update a transaction
export const updateTransaction = async (
  userId: string,
  transactionId: string,
  updates: Partial<Omit<Transaction, 'id' | 'userId' | 'createdAt'>>
): Promise<void> => {
  try {
    const transactionRef = doc(db, 'users', userId, 'transactions', transactionId);
    const updateData: Partial<Transaction> = { ...updates };

    if (updates.date) {
      updateData.date = updates.date instanceof Timestamp
        ? updates.date
        : Timestamp.fromDate(new Date(updates.date));
    }

    await updateDoc(transactionRef, updateData);
  } catch (error) {
    console.error('Error updating transaction:', error);
    throw error;
  }
};

// Delete a transaction
export const deleteTransaction = async (userId: string, transactionId: string): Promise<void> => {
  try {
    const transactionRef = doc(db, 'users', userId, 'transactions', transactionId);
    await deleteDoc(transactionRef);
  } catch (error) {
    console.error('Error deleting transaction:', error);
    throw error;
  }
};

// Get transactions by date range
export const getTransactionsByDateRange = async (
  userId: string,
  startDate: Date,
  endDate: Date
): Promise<Transaction[]> => {
  try {
    const q = query(
      collection(db, 'users', userId, 'transactions'),
      where('date', '>=', Timestamp.fromDate(startDate)),
      where('date', '<=', Timestamp.fromDate(endDate)),
      orderBy('date', 'desc')
    );

    const querySnapshot = await getDocs(q);

    return querySnapshot.docs.map(doc => {
      const data = doc.data();
      return {
        id: doc.id,
        ...data,
        date: data.date?.toDate ? data.date.toDate().toISOString() : data.date,
        createdAt: data.createdAt?.toDate ? data.createdAt.toDate() : data.createdAt
      } as Transaction;
    });
  } catch (error) {
    console.error('Error getting transactions by date range:', error);
    throw error;
  }
};