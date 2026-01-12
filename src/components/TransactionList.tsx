import React, { useState, useEffect, useRef, JSX } from 'react';
import { useTransactions } from '../contexts/TransactionContext';
import { Transaction } from '../types';
import { toDate, formatDate, formatTime } from '../types';
import {
  Filter,
  ArrowUpDown,
  Calendar,
  Clock,
  DollarSign,
  FileText,
  Check,
  ChevronDown,
  ChevronUp,
  Search,
  X,
  // Category Icons
  Utensils,
  ShoppingBag,
  Car,
  Home,
  Film,
  Heart,
  BookOpen,
  Gift,
  Gamepad2,
  Music,
  Plane,
  CreditCard,
  Receipt,
  CircleDollarSign,
  TrendingUp,
  TrendingDown,
  Trash2
} from 'lucide-react';

type FilterOption = {
  value: 'all' | 'income' | 'expense';
  label: string;
  icon: React.ComponentType<{ className?: string }>;
};
type SortOption = {
  value: 'date' | 'amount' | 'category';
  label: string;
  icon: React.ComponentType<{ className?: string }>;
  description: string;
};

const TransactionList: React.FC = () => {
  const { transactions, deleteTransaction } = useTransactions();
  const [sortBy, setSortBy] = useState<'date' | 'amount' | 'category'>('date');
  const [filterType, setFilterType] = useState<'all' | 'income' | 'expense'>('all');
  const [searchTerm, setSearchTerm] = useState('');
  const [isFilterDropdownOpen, setIsFilterDropdownOpen] = useState(false);
  const [isSortDropdownOpen, setIsSortDropdownOpen] = useState(false);
  const filterDropdownRef = useRef<HTMLDivElement>(null);
  const sortDropdownRef = useRef<HTMLDivElement>(null);

  // Sort transactions
  const sortedTransactions = [...transactions].sort((a: Transaction, b: Transaction) => {
    const dateA = toDate(a.date);
    const dateB = toDate(b.date);

    switch (sortBy) {
      case 'date':
        return dateB.getTime() - dateA.getTime();
      case 'amount':
        return b.amount - a.amount;
      case 'category':
        return a.category.localeCompare(b.category);
      default:
        return 0;
    }
  });
  // Filter transactions
  const filteredTransactions = sortedTransactions.filter((transaction: Transaction) => {
    const matchesType = filterType === 'all' || transaction.type === filterType;
    if (!searchTerm) return matchesType;

    const searchLower = searchTerm.toLowerCase();
    return (
      (transaction.description || '').toLowerCase().includes(searchLower) ||
      transaction.category.toLowerCase().includes(searchLower) ||
      (transaction.note && transaction.note.toLowerCase().includes(searchLower))
    );
  });
  // Get appropriate icon for category
  const getCategoryIcon = (category: string) => {
    const icons: Record<string, JSX.Element> = {
      'Food & Drinks': <Utensils className="h-4 w-4" />,
      'Shopping': <ShoppingBag className="h-4 w-4" />,
      'Transportation': <Car className="h-4 w-4" />,
      'Bills': <FileText className="h-4 w-4" />,
      'Entertainment': <Film className="h-4 w-4" />,
      'Health': <Heart className="h-4 w-4" />,
      'Education': <BookOpen className="h-4 w-4" />,
      'Gift': <Gift className="h-4 w-4" />,
      'Home': <Home className="h-4 w-4" />,
      'Games': <Gamepad2 className="h-4 w-4" />,
      'Music': <Music className="h-4 w-4" />,
      'Travel': <Plane className="h-4 w-4" />,
      'Salary': <DollarSign className="h-4 w-4" />,
    };
    return icons[category] || <CircleDollarSign className="h-4 w-4" />;
  };
  // Filter options
  const filterOptions: FilterOption[] = [
    { value: 'all', label: 'All', icon: FileText },
    { value: 'income', label: 'Income', icon: TrendingUp },
    { value: 'expense', label: 'Expenses', icon: TrendingDown },
  ];
  // Sort options
  const sortOptions: SortOption[] = [
    {
      value: 'date',
      label: 'Date',
      icon: Calendar,
      description: 'Sort by newest first'
    },
    {
      value: 'amount',
      label: 'Amount',
      icon: DollarSign,
      description: 'Sort by highest amount'
    },
    {
      value: 'category',
      label: 'Category',
      icon: FileText,
      description: 'Sort by category name'
    },
  ];
  // Handle filter change
  const handleFilterChange = (value: 'all' | 'income' | 'expense') => {
    setFilterType(value);
    setIsFilterDropdownOpen(false);
  };
  // Handle sort change
  const handleSortChange = (value: 'date' | 'amount' | 'category') => {
    setSortBy(value);
    setIsSortDropdownOpen(false);
  };
  // Close dropdowns when clicking outside
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (filterDropdownRef.current && !filterDropdownRef.current.contains(event.target as Node)) {
        setIsFilterDropdownOpen(false);
      }
      if (sortDropdownRef.current && !sortDropdownRef.current.contains(event.target as Node)) {
        setIsSortDropdownOpen(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, []);
  return (
    <div className="space-y-4 p-4 max-w-4xl mx-auto">
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4 mb-6">
        <h1 className="text-2xl font-bold text-gray-800">Transactions</h1>

        <div className="flex flex-col sm:flex-row gap-3 w-full md:w-auto">
          {/* Search */}
          <div className="relative flex-1">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-gray-400" />
            <input
              type="text"
              placeholder="Search transactions..."
              className="w-full pl-10 pr-4 py-2 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
            />
            {searchTerm && (
              <button
                onClick={() => setSearchTerm('')}
                className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600"
              >
                <X className="h-4 w-4" />
              </button>
            )}
          </div>
          {/* Filter Dropdown */}
          <div className="relative" ref={filterDropdownRef}>
            <button
              onClick={() => {
                setIsFilterDropdownOpen(!isFilterDropdownOpen);
                setIsSortDropdownOpen(false);
              }}
              className="flex items-center gap-2 px-4 py-2 border border-gray-200 rounded-lg hover:bg-gray-50 transition-colors w-full md:w-auto justify-between bg-white text-sm font-medium text-gray-700 shadow-sm"
            >
              <div className="flex items-center gap-2">
                <Filter className="h-4 w-4 text-gray-500" />
                <span>{filterOptions.find(f => f.value === filterType)?.label}</span>
              </div>
              {isFilterDropdownOpen ? <ChevronUp className="h-4 w-4 text-gray-400" /> : <ChevronDown className="h-4 w-4 text-gray-400" />}
            </button>

            {isFilterDropdownOpen && (
              <div className="absolute right-0 mt-1 w-48 bg-white rounded-lg shadow-lg border border-gray-200 z-10">
                {filterOptions.map((option) => {
                  const Icon = option.icon;
                  return (
                    <button
                      key={option.value}
                      className="w-full text-left px-4 py-2 hover:bg-gray-50 flex items-center gap-2"
                      onClick={() => handleFilterChange(option.value)}
                    >
                      <Icon className="h-4 w-4" />
                      <span>{option.label}</span>
                      {filterType === option.value && <Check className="ml-auto h-4 w-4 text-blue-500" />}
                    </button>
                  );
                })}
              </div>
            )}
          </div>
          {/* Sort Dropdown */}
          <div className="relative" ref={sortDropdownRef}>
            <button
              onClick={() => {
                setIsSortDropdownOpen(!isSortDropdownOpen);
                setIsFilterDropdownOpen(false);
              }}
              className="flex items-center gap-2 px-4 py-2 border border-gray-200 rounded-lg hover:bg-gray-50 transition-colors w-full md:w-auto justify-between bg-white text-sm font-medium text-gray-700 shadow-sm"
            >
              <div className="flex items-center gap-2">
                <ArrowUpDown className="h-4 w-4 text-gray-500" />
                <span>Sort</span>
              </div>
              {isSortDropdownOpen ? <ChevronUp className="h-4 w-4 text-gray-400" /> : <ChevronDown className="h-4 w-4 text-gray-400" />}
            </button>

            {isSortDropdownOpen && (
              <div className="absolute right-0 mt-1 w-64 bg-white rounded-lg shadow-lg border border-gray-200 z-10">
                {sortOptions.map((option) => {
                  const Icon = option.icon;
                  return (
                    <button
                      key={option.value}
                      className={`w-full text-left px-4 py-2 hover:bg-gray-50 flex items-center gap-3 ${sortBy === option.value ? 'bg-blue-50 text-blue-600' : ''
                        }`}
                      onClick={() => handleSortChange(option.value)}
                    >
                      <div className={`p-1 rounded-md ${sortBy === option.value ? 'bg-blue-100 text-blue-600' : 'bg-gray-100 text-gray-500'
                        }`}>
                        <Icon className="h-3.5 w-3.5" />
                      </div>
                      <div className="flex-1">
                        <div className="text-sm font-medium">{option.label}</div>
                        <div className="text-xs text-gray-500">{option.description}</div>
                      </div>
                      {sortBy === option.value && <Check className="h-4 w-4 text-blue-600" />}
                    </button>
                  );
                })}
              </div>
            )}
          </div>
        </div>
      </div>
      {filteredTransactions.length === 0 ? (
        <div className="text-center py-12">
          <div className="mx-auto h-16 w-16 text-gray-300 mb-4">
            <Receipt className="h-full w-full" />
          </div>
          <h3 className="text-lg font-medium text-gray-900 mb-1">No transactions found</h3>
          <p className="text-gray-500">
            {searchTerm || filterType !== 'all'
              ? 'Try adjusting your search or filter criteria.'
              : 'Get started by adding your first transaction.'}
          </p>
        </div>
      ) : (
        <div className="space-y-3">
          {filteredTransactions.map((transaction) => (
            <div
              key={transaction.id}
              className="bg-white rounded-xl p-4 shadow-sm hover:shadow-md transition-shadow border border-gray-100"
            >
              <div className="flex items-start justify-between">
                <div className="flex items-start gap-3">
                  <div className={`p-3 rounded-2xl flex-shrink-0 ${transaction.type === 'income'
                    ? 'bg-green-100/50 text-green-600'
                    : 'bg-red-100/50 text-red-600'
                    }`}>
                    {getCategoryIcon(transaction.category)}
                  </div>
                  <div className="flex-1">
                    <div className="flex items-center gap-2">
                      <h3 className="font-medium text-gray-900">{transaction.category}</h3>
                      <span className={`text-xs px-2 py-0.5 rounded-full ${transaction.type === 'income'
                        ? 'bg-green-100 text-green-800'
                        : 'bg-red-100 text-red-800'
                        }`}>
                        {transaction.type}
                      </span>
                    </div>
                    {transaction.description && (
                      <p className="text-sm text-gray-600 mt-1">{transaction.description}</p>
                    )}
                    {transaction.note && (
                      <p className="text-sm text-gray-500 mt-1 italic">Note: {transaction.note}</p>
                    )}
                    <div className="mt-2 flex items-center text-xs text-gray-500 space-x-4">
                      <span className="flex items-center">
                        <Calendar className="mr-1 h-3.5 w-3.5" />
                        {formatDate(transaction.date)}
                      </span>
                      <span className="flex items-center">
                        <Clock className="mr-1 h-3.5 w-3.5" />
                        {formatTime(transaction.date)}
                      </span>
                    </div>
                  </div>
                </div>
                <div className="text-right flex flex-col items-end gap-2">
                  <p className={`font-medium ${transaction.type === 'income' ? 'text-green-600' : 'text-red-600'
                    }`}>
                    {transaction.type === 'income' ? '+' : '-'}
                    ${transaction.amount.toLocaleString()}
                  </p>
                  <button
                    onClick={async (e) => {
                      e.stopPropagation();
                      if (window.confirm('Are you sure you want to delete this transaction?')) {
                        try {
                          await deleteTransaction(transaction.id);
                        } catch (error) {
                          console.error('Failed to delete transaction', error);
                        }
                      }
                    }}
                    className="p-2 text-gray-400 hover:text-red-500 hover:bg-red-50 rounded-full transition-colors"
                    title="Delete Transaction"
                  >
                    <Trash2 className="h-4 w-4" />
                  </button>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
};
export default TransactionList;