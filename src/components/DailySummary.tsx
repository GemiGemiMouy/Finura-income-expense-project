import { useState } from 'react';
import { Transaction } from '../types';
import { formatDateForComparison } from '../types';
import { useTransactions } from '../contexts/TransactionContext';
import { Pencil, Check, X } from 'lucide-react';

interface DailySummaryProps {
  transactions: Transaction[];
  selectedDate: Date;
}

const DailySummary: React.FC<DailySummaryProps> = ({ transactions, selectedDate }) => {
  const { dailyLimit, updateDailyLimit } = useTransactions();
  const [isEditingLimit, setIsEditingLimit] = useState(false);
  const [newLimit, setNewLimit] = useState(dailyLimit.toString());

  // Filter transactions for the selected date
  const dailyTransactions = transactions.filter(transaction => {
    const transactionDate = formatDateForComparison(transaction.date);
    const selectedDateStr = selectedDate.toISOString().split('T')[0];
    return transactionDate === selectedDateStr;
  });

  // Calculate totals
  const totalIncome = dailyTransactions
    .filter(t => t.type === 'income')
    .reduce((sum, t) => sum + t.amount, 0);

  const totalExpenses = dailyTransactions
    .filter(t => t.type === 'expense')
    .reduce((sum, t) => sum + t.amount, 0);

  const netAmount = totalIncome - totalExpenses;
  const remainingBudget = dailyLimit - totalExpenses;

  const handleSaveLimit = async () => {
    const limit = parseFloat(newLimit);
    if (!isNaN(limit) && limit >= 0) {
      await updateDailyLimit(limit);
      setIsEditingLimit(false);
    }
  };

  const handleCancelEdit = () => {
    setNewLimit(dailyLimit.toString());
    setIsEditingLimit(false);
  };

  return (
    <div className="bg-gradient-to-br from-white/95 to-indigo-50/80 backdrop-blur-md rounded-3xl shadow-xl border border-indigo-100/50 overflow-hidden h-full">
      <div className="bg-gradient-to-r from-indigo-100/90 to-purple-100/90 px-8 py-6 relative overflow-hidden">
        <div className="absolute inset-0 bg-gradient-to-r from-indigo-100/30 to-purple-100/30"></div>
        <div className="relative z-10">
          <h2 className="text-2xl font-bold text-indigo-800 flex items-center">
            <span className="bg-indigo-200/50 p-1.5 rounded-lg mr-3">
              <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="text-indigo-600"><rect width="18" height="18" x="3" y="4" rx="2" ry="2" /><line x1="16" x2="16" y1="2" y2="6" /><line x1="8" x2="8" y1="2" y2="6" /><line x1="3" x2="21" y1="10" y2="10" /><path d="M8 14h.01" /><path d="M12 14h.01" /><path d="M16 14h.01" /><path d="M8 18h.01" /><path d="M12 18h.01" /><path d="M16 18h.01" /></svg>
            </span>
            Daily Summary
          </h2>
          <p className="text-indigo-600 text-sm mt-1">Overview for {selectedDate.toLocaleDateString()}</p>
        </div>
      </div>

      <div className="p-6 space-y-6">
        <div className="grid grid-cols-1 gap-4">
          <div className="bg-emerald-50/80 p-4 rounded-2xl border border-emerald-100 flex justify-between items-center">
            <div>
              <div className="text-sm font-medium text-emerald-700 mb-1">Income</div>
              <div className="text-2xl font-bold text-emerald-600">${totalIncome.toLocaleString()}</div>
            </div>
            <div className="p-2 bg-emerald-100/50 rounded-xl">
              <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="text-emerald-500"><path d="M12 2v20" /><path d="M17 5H9.5a3.5 3.5 0 0 0 0 7h5a3.5 3.5 0 0 1 0 7H6" /></svg>
            </div>
          </div>

          <div className="bg-rose-50/80 p-4 rounded-2xl border border-rose-100 flex justify-between items-center">
            <div>
              <div className="text-sm font-medium text-rose-700 mb-1">Expenses</div>
              <div className="text-2xl font-bold text-rose-600">${totalExpenses.toLocaleString()}</div>
            </div>
            <div className="p-2 bg-rose-100/50 rounded-xl">
              <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="text-rose-500"><path d="M12 2v20" /><path d="M17 5H9.5a3.5 3.5 0 0 0 0 7h5a3.5 3.5 0 0 1 0 7H6" /></svg>
            </div>
          </div>

          <div className={`p-4 rounded-2xl border flex justify-between items-center ${remainingBudget >= 0 ? 'bg-blue-50/80 border-blue-100' : 'bg-amber-50/80 border-amber-100'}`}>
            <div>
              <div className={`text-sm font-medium mb-1 ${remainingBudget >= 0 ? 'text-blue-700' : 'text-amber-700'}`}>
                {remainingBudget >= 0 ? 'Remaining' : 'Over Budget'}
              </div>
              <div className={`text-2xl font-bold ${remainingBudget >= 0 ? 'text-blue-600' : 'text-amber-600'}`}>
                ${Math.abs(remainingBudget).toLocaleString()}
              </div>
            </div>
          </div>
        </div>

        <div className="bg-gray-50/50 rounded-2xl p-4 border border-gray-100">
          <div className="flex justify-between items-center mb-3">
            <div className="flex items-center space-x-2">
              <span className="text-sm font-semibold text-gray-700">Daily Limit</span>
              {isEditingLimit ? (
                <div className="flex items-center space-x-1 bg-white p-1 rounded-lg border border-gray-200">
                  <input
                    type="number"
                    value={newLimit}
                    onChange={(e) => setNewLimit(e.target.value)}
                    className="w-20 px-2 py-1 text-sm outline-none bg-transparent"
                    autoFocus
                  />
                  <button onClick={handleSaveLimit} className="text-green-600 hover:bg-green-50 p-1 rounded"><Check size={14} /></button>
                  <button onClick={handleCancelEdit} className="text-red-600 hover:bg-red-50 p-1 rounded"><X size={14} /></button>
                </div>
              ) : (
                <div className="flex items-center group cursor-pointer" onClick={() => { setNewLimit(dailyLimit.toString()); setIsEditingLimit(true); }}>
                  <span className="text-sm text-gray-600 mr-2">${dailyLimit.toLocaleString()}</span>
                  <Pencil size={12} className="text-gray-400 opacity-0 group-hover:opacity-100 transition-opacity" />
                </div>
              )}
            </div>
            <span className="text-xs font-bold text-gray-500 bg-white px-2 py-1 rounded-full shadow-sm">
              {((totalExpenses / dailyLimit) * 100).toFixed(0)}%
            </span>
          </div>

          <div className="w-full bg-gray-200/80 rounded-full h-3 overflow-hidden">
            <div
              className={`h-full rounded-full transition-all duration-500 ${(totalExpenses / dailyLimit) > 0.9 ? 'bg-gradient-to-r from-red-400 to-rose-500' :
                  (totalExpenses / dailyLimit) > 0.5 ? 'bg-gradient-to-r from-amber-400 to-orange-500' :
                    'bg-gradient-to-r from-emerald-400 to-green-500'
                }`}
              style={{ width: `${Math.min(100, (totalExpenses / dailyLimit) * 100)}%` }}
            ></div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default DailySummary;