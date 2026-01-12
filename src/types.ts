// src/types.ts
import { Timestamp } from 'firebase/firestore';

export const DAILY_LIMIT = 1000;

export interface TransactionInput {
  userId: string;
  type: 'income' | 'expense';
  amount: number;
  category: string;
  description?: string;
  note?: string;
  date: string | Date; // Only string or Date for input
}

export interface Transaction extends Omit<TransactionInput, 'date'> {
  id: string;
  date: string | Timestamp; // Can be Timestamp from Firestore
  createdAt: Timestamp;
}

// Type guard to check if a value is a Firestore Timestamp
export const isTimestamp = (value: any): value is Timestamp => {
  return value && typeof value === 'object' && 'toDate' in value && 'toMillis' in value;
};

// Helper function to format date for comparison (YYYY-MM-DD)
export const formatDateForComparison = (date: string | Timestamp): string => {
  if (isTimestamp(date)) {
    return date.toDate().toISOString().split('T')[0];
  }
  return date.split('T')[0]; // If it's already a string, ensure it's in YYYY-MM-DD format
};

// Helper function to convert any date-like value to a Date object
export const toDate = (date: string | Date | Timestamp): Date => {
  if (isTimestamp(date)) {
    return date.toDate();
  }
  return new Date(date);
};

// Helper function to format date as YYYY-MM-DD
export const formatDate = (date: string | Timestamp): string => {
  const d = toDate(date);
  return d.toISOString().split('T')[0];
};

// Helper function to format time as HH:MM
export const formatTime = (date: string | Timestamp): string => {
  const d = toDate(date);
  return d.toTimeString().slice(0, 5);
};

// Helper function to check if a date is today
export const isToday = (date: string | Timestamp): boolean => {
  const today = new Date().toISOString().split('T')[0];
  return formatDate(date) === today;
};