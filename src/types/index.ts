import { Timestamp } from 'firebase/firestore';

export type Transaction = {
  id: string;
  type: 'income' | 'expense';
  amount: number;
  category: string;
  date: string | Timestamp;
  note?: string;
  userId: string;
  createdAt?: Timestamp;
};