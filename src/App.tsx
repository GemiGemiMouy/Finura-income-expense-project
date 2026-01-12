import React from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import { AuthProvider, useAuth } from './contexts/AuthContext';
import { TransactionProvider, useTransactions } from './contexts/TransactionContext';
import { Wallet, TrendingUp, Target, Sparkles, Calendar, Clock, LogOut } from 'lucide-react';
import { Transaction } from './types';

// Components
import AddTransactionForm from './components/AddTransactionForm';
import DailySummary from './components/DailySummary';
import TodoList from './components/TodoList';
import TransactionList from './components/TransactionList';
import MonthlySavings from './components/MonthlySavings';
import Charts from './components/Charts';
import Login from './components/Login';
import Signup from './components/Signup';
import PrivateRoute from './components/PrivateRoute';
import Navbar from './components/Navbar';

// Main App Component
const App: React.FC = () => {
  return (
    <Router>
      <AuthProvider>
        <TransactionProvider>
          <Routes>
            <Route path="/login" element={<Login />} />
            <Route path="/signup" element={<Signup />} />
            <Route path="/" element={
              <PrivateRoute>
                <Dashboard />
              </PrivateRoute>
            } />
            <Route path="*" element={<Navigate to="/" replace />} />
          </Routes>
        </TransactionProvider>
      </AuthProvider>
    </Router>
  );
};

// Dashboard Component (Protected Route)
const Dashboard: React.FC = () => {
  const { currentUser, logout } = useAuth();
  const { transactions } = useTransactions();

  // Helper function to calculate total amount by type
  const calculateTotal = (type: 'income' | 'expense'): number => {
    return transactions
      .filter((t: Transaction) => t.type === type)
      .reduce((sum: number, t: Transaction) => sum + t.amount, 0);
  };

  const totalIncome = calculateTotal('income');
  const totalExpenses = calculateTotal('expense');
  const netBalance = totalIncome - totalExpenses;

  return (
    <div className="min-h-screen bg-gradient-to-br from-indigo-50 via-white to-purple-50">
      <Navbar />

      {/* Spacer for fixed navbar */}
      <div className="h-16"></div>

      {/* Hero Stats Section */}
      <div className="pt-8 pb-4 px-4 sm:px-6 lg:px-8 max-w-7xl mx-auto">
        <div className="text-center mb-8">
          <h1 className="text-3xl md:text-4xl font-bold text-gray-900 mb-2">
            Welcome back
          </h1>
          <p className="text-gray-500">Here's your financial overview for today</p>
        </div>

        {/* Stats Grid */}
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 max-w-5xl mx-auto">
          <div className="bg-white/60 backdrop-blur-sm rounded-2xl p-4 border border-indigo-100 shadow-sm hover:shadow-md transition-all">
            <div className="text-2xl font-bold text-indigo-600">{transactions.length}</div>
            <div className="text-xs text-gray-500 font-medium uppercase tracking-wider mt-1">Transactions</div>
          </div>
          <div className="bg-white/60 backdrop-blur-sm rounded-2xl p-4 border border-green-100 shadow-sm hover:shadow-md transition-all">
            <div className="text-2xl font-bold text-green-600">
              ${totalIncome.toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
            </div>
            <div className="text-xs text-gray-500 font-medium uppercase tracking-wider mt-1">Income</div>
          </div>
          <div className="bg-white/60 backdrop-blur-sm rounded-2xl p-4 border border-red-100 shadow-sm hover:shadow-md transition-all">
            <div className="text-2xl font-bold text-red-500">
              ${totalExpenses.toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
            </div>
            <div className="text-xs text-gray-500 font-medium uppercase tracking-wider mt-1">Expenses</div>
          </div>
          <div className="bg-white/60 backdrop-blur-sm rounded-2xl p-4 border border-purple-100 shadow-sm hover:shadow-md transition-all">
            <div className="text-2xl font-bold text-purple-600">
              ${netBalance.toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
            </div>
            <div className="text-xs text-gray-500 font-medium uppercase tracking-wider mt-1">Net Balance</div>
          </div>
        </div>
      </div>

      {/* Main Content */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-8">

        {/* Zone A: Quick Overview */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          <DailySummary transactions={transactions} selectedDate={new Date()} />
          <MonthlySavings />
          <TodoList />
        </div>

        {/* Zone B: Action & History */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          <div className="lg:col-span-1">
            <AddTransactionForm />
          </div>
          <div className="lg:col-span-2">
            <div className="bg-white/60 backdrop-blur-md rounded-3xl p-1 shadow-lg border border-white/50 h-full">
              <TransactionList />
            </div>
          </div>
        </div>

        {/* Zone C: Analytics */}
        <Charts />
      </div>
    </div>
  );
};

export default App;
