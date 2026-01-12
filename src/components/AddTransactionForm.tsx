import React, { useState, useEffect, useRef } from 'react';
import { formatDateForComparison } from '../types';
import { useTransactions } from '../contexts/TransactionContext';
import { Plus, DollarSign, Tag, FileText, TrendingUp, TrendingDown, AlertCircle, CheckCircle, ChevronDown } from 'lucide-react';

const AddTransactionForm: React.FC = () => {
  const { transactions, addTransaction, dailyLimit } = useTransactions();
  const [type, setType] = useState<'income' | 'expense'>('expense');
  const [amount, setAmount] = useState<number>(0);
  const [category, setCategory] = useState('');
  const [note, setNote] = useState('');
  const [showSuccess, setShowSuccess] = useState(false);
  const [showError, setShowError] = useState(false);
  const [isDropdownOpen, setIsDropdownOpen] = useState(false);
  const dropdownRef = useRef<HTMLDivElement>(null);

  // Close dropdown when clicking outside
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
        setIsDropdownOpen(false);
      }
    };

    if (isDropdownOpen) {
      document.addEventListener('mousedown', handleClickOutside);
    }

    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, [isDropdownOpen]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!amount || !category) {
      setShowError(true);
      setTimeout(() => setShowError(false), 3000);
      return;
    }

    try {
      const today = new Date().toISOString().split('T')[0];

      // Check daily limit for expenses
      if (type === 'expense') {
        const todayExpenses = transactions
          .filter(t => t.type === 'expense' && formatDateForComparison(t.date) === today)
          .reduce((sum, t) => sum + t.amount, 0);

        if (todayExpenses + amount > dailyLimit) {
          setShowError(true);
          setTimeout(() => setShowError(false), 3000);
          return;
        }
      }

      const newTransaction = {
        type,
        amount,
        category,
        description: category, // Using category as description
        date: new Date().toISOString(),
        ...(note ? { note } : {}), // Only include note if it's truthy
      };

      await addTransaction(newTransaction);
    } catch (error) {
      console.error(error);
    }

    setAmount(0);
    setCategory('');
    setNote('');
    setShowSuccess(true);
    setTimeout(() => setShowSuccess(false), 2000);
  };

  // Calculate remaining daily limit
  const today = new Date().toISOString().split('T')[0];
  const todayExpenses = transactions
    .filter(t => t.type === 'expense' && formatDateForComparison(t.date) === today)
    .reduce((sum, t) => sum + t.amount, 0);
  const remainingLimit = Math.max(dailyLimit - todayExpenses, 0);

  const handleTypeSelect = (selectedType: 'income' | 'expense') => {
    setType(selectedType);
    setIsDropdownOpen(false);
  };

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'Escape') {
      setIsDropdownOpen(false);
    }
  };

  const transactionTypes = [
    {
      value: 'income' as const,
      label: 'Income',
      icon: TrendingUp,
      color: 'text-green-500',
      bgColor: 'bg-green-100',
      description: 'Money coming in'
    },
    {
      value: 'expense' as const,
      label: 'Expense',
      icon: TrendingDown,
      color: 'text-red-500',
      bgColor: 'bg-red-100',
      description: 'Money going out'
    }
  ];

  const selectedType = transactionTypes.find(t => t.value === type);

  return (
    <div className="bg-gradient-to-br from-white/95 to-green-50/80 backdrop-blur-md rounded-3xl shadow-xl border border-green-100/50 overflow-hidden">
      {/* Header */}
      <div className="bg-gradient-to-r from-green-100/90 to-emerald-100/90 px-8 py-6 relative overflow-hidden">
        <div className="absolute inset-0 bg-gradient-to-r from-green-100/30 to-emerald-100/30"></div>
        <div className="absolute inset-0 bg-[radial-gradient(circle_at_30%_20%,rgba(255,255,255,0.3),transparent_50%)]"></div>
        <div className="relative z-10">
          <h2 className="text-2xl font-bold text-green-800 flex items-center">
            <Plus className="mr-3 h-7 w-7 text-green-600" />
            Add Transaction
          </h2>
          <p className="text-green-600 text-sm mt-2">Track your income and expenses</p>
        </div>
      </div>

      <form onSubmit={handleSubmit} className="p-6 space-y-5">
        {/* Transaction Type and Amount */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div className="space-y-3">
            <label className="block text-sm font-semibold text-gray-700 flex items-center">
              <Tag className="mr-2 h-4 w-4" />
              Transaction Type
            </label>

            {/* Custom Dropdown */}
            <div className="relative" ref={dropdownRef}>
              <button
                type="button"
                onClick={() => setIsDropdownOpen(!isDropdownOpen)}
                onKeyDown={handleKeyDown}
                className="w-full px-4 py-4 pl-12 pr-4 border border-green-200/60 rounded-2xl focus:ring-2 focus:ring-green-400 focus:border-transparent transition-all duration-200 bg-gradient-to-r from-white/90 to-green-50/60 backdrop-blur-sm text-left flex items-center justify-between hover:from-white/95 hover:to-green-50/80"
                aria-haspopup="listbox"
                aria-expanded={isDropdownOpen}
              >
                <div className="flex items-center">
                  {selectedType && (
                    <>
                      <selectedType.icon className={`h-5 w-5 ${selectedType.color} mr-3`} />
                      <div>
                        <div className="font-medium text-gray-900">{selectedType.label}</div>
                        <div className="text-xs text-gray-500">{selectedType.description}</div>
                      </div>
                    </>
                  )}
                </div>
                <ChevronDown
                  className={`h-5 w-5 text-gray-400 transition-transform duration-200 ${isDropdownOpen ? 'rotate-180' : ''
                    }`}
                />
              </button>

              {/* Dropdown Menu */}
              {isDropdownOpen && (
                <div
                  className="absolute z-50 w-full mt-2 bg-gradient-to-br from-white/98 to-green-50/95 backdrop-blur-md border border-green-200/60 rounded-2xl shadow-lg overflow-hidden"
                  role="listbox"
                  aria-label="Transaction type options"
                >
                  {transactionTypes.map((option) => {
                    const IconComponent = option.icon;
                    return (
                      <button
                        key={option.value}
                        type="button"
                        onClick={() => handleTypeSelect(option.value)}
                        className={`w-full px-4 py-4 text-left hover:bg-green-50/80 transition-all duration-200 flex items-center ${type === option.value ? 'bg-green-100/80' : ''
                          }`}
                        role="option"
                        aria-selected={type === option.value}
                      >
                        <div className={`p-2 rounded-xl mr-3 ${option.bgColor}`}>
                          <IconComponent className={`h-5 w-5 ${option.color}`} />
                        </div>
                        <div>
                          <div className="font-medium text-gray-900">{option.label}</div>
                          <div className="text-xs text-gray-500">{option.description}</div>
                        </div>
                        {type === option.value && (
                          <CheckCircle className="h-5 w-5 text-green-500 ml-auto" />
                        )}
                      </button>
                    );
                  })}
                </div>
              )}
            </div>
          </div>

          <div className="space-y-3">
            <label className="block text-sm font-semibold text-gray-700 flex items-center">
              <DollarSign className="mr-2 h-4 w-4" />
              Amount
            </label>
            <input
              type="number"
              step="0.01"
              min="0"
              value={amount || ''}
              onChange={(e) => setAmount(parseFloat(e.target.value) || 0)}
              className="w-full px-4 py-4 pl-12 border border-green-200/60 rounded-2xl focus:ring-2 focus:ring-green-400 focus:border-transparent transition-all duration-200 bg-gradient-to-r from-white/90 to-green-50/60 backdrop-blur-sm"
              placeholder="0.00"
              required
            />
            <div className="absolute left-4 top-1/2 transform -translate-y-1/2 pointer-events-none">
              <DollarSign className="h-5 w-5 text-green-600" />
            </div>
          </div>
        </div>

        {/* Category and Note */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div className="space-y-3">
            <label className="block text-sm font-semibold text-gray-700 flex items-center">
              <FileText className="mr-2 h-4 w-4" />
              Category
            </label>
            <input
              type="text"
              value={category}
              onChange={(e) => setCategory(e.target.value)}
              className="w-full px-4 py-4 pl-12 border border-green-200/60 rounded-2xl focus:ring-2 focus:ring-green-400 focus:border-transparent transition-all duration-200 bg-gradient-to-r from-white/90 to-green-50/60 backdrop-blur-sm"
              placeholder="e.g., Food, Transport, Salary"
              required
            />
            <div className="absolute left-4 top-1/2 transform -translate-y-1/2 pointer-events-none">
              <FileText className="h-5 w-5 text-green-600" />
            </div>
          </div>

          <div className="space-y-3">
            <label className="block text-sm font-semibold text-gray-700">
              Note (Optional)
            </label>
            <input
              type="text"
              value={note}
              onChange={(e) => setNote(e.target.value)}
              className="w-full px-4 py-4 border border-green-200/60 rounded-2xl focus:ring-2 focus:ring-green-400 focus:border-transparent transition-all duration-200 bg-gradient-to-r from-white/90 to-green-50/60 backdrop-blur-sm"
              placeholder="Add a note..."
            />
          </div>
        </div>

        {/* Daily Limit Progress */}
        {type === 'expense' && (
          <div className="space-y-3">
            <div className="flex items-center justify-between text-sm">
              <span className="text-gray-600">Daily Spending Limit</span>
              <span className="font-semibold text-gray-800">
                ${todayExpenses.toFixed(2)} / ${dailyLimit.toFixed(2)}
              </span>
            </div>
            <div className="w-full bg-gray-200 rounded-full h-3">
              <div
                className={`h-3 rounded-full transition-all duration-300 ${todayExpenses / dailyLimit > 0.8 ? 'bg-red-500' : 'bg-green-500'
                  }`}
                style={{ width: `${Math.min((todayExpenses / dailyLimit) * 100, 100)}%` }}
              ></div>
            </div>
            <p className="text-xs text-gray-500">
              Remaining: ${remainingLimit.toFixed(2)}
            </p>
          </div>
        )}

        {/* Submit Button */}
        <button
          type="submit"
          className="w-full bg-gradient-to-r from-green-400 to-emerald-500 text-white font-semibold py-4 px-6 rounded-2xl hover:from-green-500 hover:to-emerald-600 transition-all duration-200 shadow-lg hover:shadow-xl transform hover:scale-[1.02]"
        >
          Add Transaction
        </button>

        {/* Success Message */}
        {showSuccess && (
          <div className="flex items-center justify-center p-4 bg-green-100 border border-green-200 rounded-2xl">
            <CheckCircle className="h-5 w-5 text-green-600 mr-2" />
            <span className="text-green-800 font-medium">Transaction added successfully!</span>
          </div>
        )}

        {/* Error Message */}
        {showError && (
          <div className="flex items-center justify-center p-4 bg-red-100 border border-red-200 rounded-2xl">
            <AlertCircle className="h-5 w-5 text-red-600 mr-2" />
            <span className="text-red-800 font-medium">Daily spending limit exceeded!</span>
          </div>
        )}
      </form>
    </div>
  );
};

export default AddTransactionForm;