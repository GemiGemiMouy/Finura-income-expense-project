import React from 'react';
import { useTransactions } from '../contexts/TransactionContext';
import { formatDateForComparison } from '../types';
import {
  PieChart,
  Pie,
  Cell,
  Tooltip,
  ResponsiveContainer,
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Legend,
  TooltipProps
} from 'recharts';
import { BarChart3, PieChart as PieChartIcon, TrendingUp, TrendingDown, DollarSign, Calendar, AlertCircle, Plus } from 'lucide-react';

type TooltipFormatter = TooltipProps<number, string>['formatter'];
type TooltipLabelFormatter = TooltipProps<number, string>['labelFormatter'];

interface ChartDataPoint {
  name: string;
  value: number;
  [key: string]: string | number; // Add index signature
}
interface DailyDataPoint {
  date: string;
  income: number;
  expense: number;
}

interface MonthlyDataPoint {
  month: string;
  income: number;
  expense: number;
  savings: number;
}

const COLORS = ['#FF6384', '#36A2EB', '#FFCE56', '#4BC0C0', '#9966FF', '#FF9F40', '#FF6B6B', '#4ECDC4'];

const Charts: React.FC = () => {
  const { transactions } = useTransactions();
  // Pie chart: Expenses by category (current month)
  const currentMonth = new Date().toISOString().slice(0, 7);
  const expenseData = transactions
    .filter(t => t.type === 'expense' && formatDateForComparison(t.date).startsWith(currentMonth))
    .reduce((acc: ChartDataPoint[], t) => {
      const found = acc.find(a => a.name === t.category);
      if (found) {
        found.value += t.amount;
      } else {
        acc.push({ name: t.category, value: t.amount });
      }
      return acc;
    }, []);

  // Bar chart: Income vs Expense by day (last 7 days)
  const days: string[] = [];
  const dailyData: DailyDataPoint[] = [];
  for (let i = 6; i >= 0; i--) {
    const d = new Date();
    d.setDate(d.getDate() - i);
    const dateStr = d.toISOString().split('T')[0];
    days.push(dateStr);

    const dayIncome = transactions
      .filter(t => t.type === 'income' && formatDateForComparison(t.date) === dateStr)
      .reduce((sum, t) => sum + t.amount, 0);
    const dayExpense = transactions
      .filter(t => t.type === 'expense' && formatDateForComparison(t.date) === dateStr)
      .reduce((sum, t) => sum + t.amount, 0);

    dailyData.push({
      date: d.toLocaleDateString('en-US', { weekday: 'short' }),
      income: dayIncome,
      expense: dayExpense
    });
  }

  // Monthly trend data
  const monthlyTrendData: MonthlyDataPoint[] = [];
  for (let i = 5; i >= 0; i--) {
    const d = new Date();
    d.setMonth(d.getMonth() - i);
    const monthStr = formatDateForComparison(d.toISOString().slice(0, 7));

    const monthIncome = transactions
      .filter(t => t.type === 'income' && formatDateForComparison(t.date).startsWith(monthStr))
      .reduce((sum, t) => sum + t.amount, 0);
    const monthExpense = transactions
      .filter(t => t.type === 'expense' && formatDateForComparison(t.date).startsWith(monthStr))
      .reduce((sum, t) => sum + t.amount, 0);

    monthlyTrendData.push({
      month: d.toLocaleDateString('en-US', { month: 'short' }),
      income: monthIncome,
      expense: monthExpense,
      savings: monthIncome - monthExpense
    });
  }

  return (
    <div className="bg-gradient-to-br from-white/95 to-indigo-50/80 backdrop-blur-md rounded-3xl shadow-xl border border-indigo-100/50 overflow-hidden flex flex-col">
      <div className="bg-gradient-to-r from-indigo-100/90 to-blue-100/90 px-8 py-6 relative overflow-hidden flex-shrink-0">
        <div className="absolute inset-0 bg-gradient-to-r from-indigo-100/30 to-blue-100/30"></div>
        <div className="absolute inset-0 bg-[radial-gradient(circle_at_50%_20%,rgba(255,255,255,0.3),transparent_50%)]"></div>
        <div className="relative z-10">
          <h2 className="text-2xl font-bold text-indigo-800 flex items-center">
            <BarChart3 className="mr-3 h-7 w-7 text-indigo-600" />
            Analytics & Insights
          </h2>
          <p className="text-indigo-600 text-sm mt-2">Visualize your spending patterns</p>
        </div>
      </div>

      <div className="p-6 space-y-6 flex-grow overflow-y-auto custom-scrollbar">
        {/* Top Row: Pie Chart & Daily Bar Chart */}
        <div className="grid grid-cols-1 xl:grid-cols-2 gap-6">
          {/* Pie Chart */}
          <div className="bg-white/50 rounded-2xl p-4 border border-indigo-50 shadow-sm">
            <h3 className="text-base font-semibold text-gray-800 flex items-center mb-4">
              <PieChartIcon className="mr-2 h-4 w-4 text-indigo-600" />
              Expenses by Category
            </h3>
            {expenseData.length === 0 ? (
              <div className="h-48 flex items-center justify-center text-center">
                <div>
                  <p className="text-gray-400 text-sm mb-2">No expenses yet</p>
                  <Plus className="h-6 w-6 text-indigo-300 mx-auto" />
                </div>
              </div>
            ) : (
              <div className="h-64">
                <ResponsiveContainer width="100%" height="100%">
                  <PieChart>
                    <Pie
                      data={expenseData}
                      dataKey="value"
                      nameKey="name"
                      cx="50%"
                      cy="50%"
                      outerRadius={80}
                      innerRadius={35}
                      label={({ name = '', percent = 0 }) =>
                        `${name} ${(percent * 100).toFixed(0)}%`
                      }
                      labelLine={false}
                    >
                      {expenseData.map((entry, index) => (
                        <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                      ))}
                    </Pie>
                    <Tooltip
                      formatter={(value: number | undefined) => [`$${(value || 0).toFixed(2)}`, '']}
                      contentStyle={{ backgroundColor: 'rgba(255, 255, 255, 0.95)', borderRadius: '8px', border: 'none', boxShadow: '0 4px 6px -1px rgba(0,0,0,0.1)' }}
                    />
                  </PieChart>
                </ResponsiveContainer>
              </div>
            )}
          </div>

          {/* Daily Bar Chart */}
          <div className="bg-white/50 rounded-2xl p-4 border border-indigo-50 shadow-sm">
            <h3 className="text-base font-semibold text-gray-800 flex items-center mb-4">
              <BarChart3 className="mr-2 h-4 w-4 text-indigo-600" />
              Last 7 Days
            </h3>
            <div className="h-64">
              <ResponsiveContainer width="100%" height="100%">
                <BarChart data={dailyData} margin={{ top: 10, right: 10, left: 0, bottom: 0 }}>
                  <CartesianGrid strokeDasharray="3 3" stroke="#f0f0f0" vertical={false} />
                  <XAxis dataKey="date" tick={{ fontSize: 10 }} axisLine={false} tickLine={false} dy={10} />
                  <YAxis tick={{ fontSize: 10 }} axisLine={false} tickLine={false} tickFormatter={(value) => `$${value}`} />
                  <Tooltip
                    formatter={(value: number | undefined) => [`$${(value || 0).toFixed(2)}`, '']}
                    contentStyle={{ backgroundColor: 'rgba(255, 255, 255, 0.95)', borderRadius: '8px', border: 'none', boxShadow: '0 4px 6px -1px rgba(0,0,0,0.1)' }}
                  />
                  <Legend iconType="circle" wrapperStyle={{ fontSize: '12px', paddingTop: '10px' }} />
                  <Bar dataKey="income" fill="#10b981" name="Income" radius={[4, 4, 0, 0]} maxBarSize={40} />
                  <Bar dataKey="expense" fill="#ef4444" name="Expense" radius={[4, 4, 0, 0]} maxBarSize={40} />
                </BarChart>
              </ResponsiveContainer>
            </div>
          </div>
        </div>

        {/* Monthly Trend - Full Width */}
        {monthlyTrendData.some(d => d.income > 0 || d.expense > 0) && (
          <div className="bg-white/50 rounded-2xl p-4 border border-indigo-50 shadow-sm">
            <h3 className="text-base font-semibold text-gray-800 flex items-center mb-4">
              <TrendingUp className="mr-2 h-4 w-4 text-indigo-600" />
              Monthly Trend
            </h3>
            <div className="h-56">
              <ResponsiveContainer width="100%" height="100%">
                <BarChart data={monthlyTrendData} margin={{ top: 10, right: 10, left: 0, bottom: 0 }}>
                  <CartesianGrid strokeDasharray="3 3" stroke="#f0f0f0" vertical={false} />
                  <XAxis dataKey="month" tick={{ fontSize: 11 }} axisLine={false} tickLine={false} dy={10} />
                  <YAxis tick={{ fontSize: 11 }} axisLine={false} tickLine={false} tickFormatter={(value) => `$${value}`} />
                  <Tooltip
                    formatter={(value: number | undefined) => [`$${(value || 0).toFixed(2)}`, '']}
                    contentStyle={{ backgroundColor: 'rgba(255, 255, 255, 0.95)', borderRadius: '8px', border: 'none', boxShadow: '0 4px 6px -1px rgba(0,0,0,0.1)' }}
                  />
                  <Legend iconType="circle" wrapperStyle={{ fontSize: '12px', paddingTop: '10px' }} />
                  <Bar dataKey="income" fill="#3b82f6" name="Income" radius={[4, 4, 0, 0]} maxBarSize={50} />
                  <Bar dataKey="expense" fill="#ef4444" name="Expense" radius={[4, 4, 0, 0]} maxBarSize={50} />
                </BarChart>
              </ResponsiveContainer>
            </div>
          </div>
        )}

        {/* Quick Stats Grid - Compact */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 pt-2">
          <div className="bg-blue-50/50 p-4 rounded-xl border border-blue-100 flex items-center justify-between">
            <div>
              <p className="text-xs font-semibold text-blue-800 uppercase tracking-wide">Categories</p>
              <p className="text-2xl font-bold text-blue-600">{expenseData.length}</p>
            </div>
            <BarChart3 className="h-8 w-8 text-blue-200" />
          </div>

          <div className="bg-green-50/50 p-4 rounded-xl border border-green-100 flex items-center justify-between">
            <div>
              <p className="text-xs font-semibold text-green-800 uppercase tracking-wide">Avg Income</p>
              <p className="text-2xl font-bold text-green-600">${(dailyData.reduce((sum, d) => sum + d.income, 0) / 7).toFixed(0)}</p>
            </div>
            <TrendingUp className="h-8 w-8 text-green-200" />
          </div>

          <div className="bg-red-50/50 p-4 rounded-xl border border-red-100 flex items-center justify-between">
            <div>
              <p className="text-xs font-semibold text-red-800 uppercase tracking-wide">Avg Expense</p>
              <p className="text-2xl font-bold text-red-600">${(dailyData.reduce((sum, d) => sum + d.expense, 0) / 7).toFixed(0)}</p>
            </div>
            <TrendingDown className="h-8 w-8 text-red-200" />
          </div>
        </div>
      </div>
    </div>
  );
};

export default Charts;
