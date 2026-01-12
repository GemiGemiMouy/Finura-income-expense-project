// src/components/MonthlySavings.tsx
import React from 'react';
import { useTransactions } from '../contexts/TransactionContext';
import { formatDateForComparison } from '../types';
import { TrendingUp, TrendingDown, DollarSign, Calendar } from 'lucide-react';

const MonthlySavings: React.FC = () => {
  const { transactions } = useTransactions();
  const month = new Date().toISOString().slice(0, 7); // YYYY-MM

  const monthlyIncome = transactions
    .filter(t => t.type === 'income' && formatDateForComparison(t.date).startsWith(month))
    .reduce((sum, t) => sum + t.amount, 0);

  const monthlyExpenses = transactions
    .filter(t => t.type === 'expense' && formatDateForComparison(t.date).startsWith(month))
    .reduce((sum, t) => sum + t.amount, 0);

  const savings = monthlyIncome - monthlyExpenses;
  const savingsPercentage = monthlyIncome > 0 ? (savings / monthlyIncome) * 100 : 0;

  return (
    <div className="bg-gradient-to-br from-white/95 to-blue-50/80 backdrop-blur-md rounded-3xl shadow-xl border border-blue-100/50 overflow-hidden">
      <div className="bg-gradient-to-r from-blue-100/90 to-cyan-100/90 px-8 py-6 relative overflow-hidden">
        <div className="absolute inset-0 bg-gradient-to-r from-blue-100/30 to-cyan-100/30"></div>
        <div className="relative z-10">
          <h2 className="text-2xl font-bold text-blue-800 flex items-center">
            <Calendar className="mr-3 h-7 w-7 text-blue-600" />
            Monthly Savings
          </h2>
          <p className="text-blue-600 text-sm mt-2">Overview for {new Date().toLocaleDateString('en-US', { month: 'long' })}</p>
        </div>
      </div>

      <div className="p-6 space-y-6">
        <div className="space-y-4">
          <div className="flex justify-between items-center bg-green-50/50 p-4 rounded-xl border border-green-100">
            <span className="text-sm font-medium text-gray-500">Income</span>
            <div className="flex items-center">
              <DollarSign className="h-4 w-4 text-green-500 mr-1" />
              <span className="font-bold text-lg text-gray-800">${monthlyIncome.toLocaleString()}</span>
            </div>
          </div>
          <div className="flex justify-between items-center bg-red-50/50 p-4 rounded-xl border border-red-100">
            <span className="text-sm font-medium text-gray-500">Expenses</span>
            <div className="flex items-center">
              <DollarSign className="h-4 w-4 text-red-500 mr-1" />
              <span className="font-bold text-lg text-gray-800">${monthlyExpenses.toLocaleString()}</span>
            </div>
          </div>
        </div>

        <div className="pt-4 mt-4 border-t border-gray-200">
          <div className="flex justify-between items-center mb-3">
            <div className="flex items-center">
              <span className="text-sm font-medium text-gray-600 mr-2">Net Savings</span>
              {savings >= 0 ? (
                <TrendingUp className="h-4 w-4 text-green-500" />
              ) : (
                <TrendingDown className="h-4 w-4 text-red-500" />
              )}
            </div>
            <span className={`text-xl font-bold ${savings >= 0 ? 'text-green-600' : 'text-red-600'}`}>
              ${Math.abs(savings).toLocaleString()}
            </span>
          </div>

          <div className="mt-2">
            <div className="w-full bg-gray-200 rounded-full h-3">
              <div
                className={`h-3 rounded-full transition-all duration-500 ease-out ${savings >= 0 ? 'bg-gradient-to-r from-green-400 to-emerald-500' : 'bg-gradient-to-r from-red-400 to-rose-500'
                  }`}
                style={{ width: `${Math.min(Math.abs(savingsPercentage), 100)}%` }}
              ></div>
            </div>
            <p className="text-xs text-gray-500 mt-2 text-right font-medium">
              {savingsPercentage.toFixed(1)}% of income saved
            </p>
          </div>
        </div>
      </div>
    </div>
  );
};

export default MonthlySavings;