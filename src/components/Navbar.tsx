import React, { useState, useRef } from 'react';
import { Download, FileSpreadsheet, User as UserIcon, LogOut, Menu, X } from 'lucide-react';
import { useAuth } from '../contexts/AuthContext';
import { useTransactions } from '../contexts/TransactionContext';


const Navbar: React.FC = () => {
    const { currentUser, logout } = useAuth();
    const { transactions } = useTransactions();
    const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
    const [isProfileMenuOpen, setIsProfileMenuOpen] = useState(false);


    const handleLogout = async () => {
        try {
            await logout();
        } catch (error) {
            console.error("Failed to log out", error);
        }
    };

    const handleExportCSV = () => {
        // Define headers
        const headers = ['Date', 'Type', 'Category', 'Amount', 'Note'];

        // Convert transactions to CSV rows
        // Convert transactions to CSV rows
        const csvRows = transactions.map(t => {
            let dateStr = '';
            try {
                // t.date is likely an ISO string from the service, but handle edge cases
                const dateVal = t.date;
                if (!dateVal) {
                    dateStr = 'Unknown';
                } else if ((dateVal as any).toDate) {
                    // Firestore Timestamp
                    dateStr = (dateVal as any).toDate().toISOString().split('T')[0];
                } else {
                    // String or Date object
                    dateStr = new Date(dateVal as string).toISOString().split('T')[0];
                }
            } catch (e) {
                console.error("Date parsing error", e, t.date);
                dateStr = 'Invalid Date';
            }

            const note = (t.note || '').replace(/"/g, '""'); // Escape double quotes
            return `${dateStr},${t.type},${t.category},${t.amount},"${note}"`;
        });

        // Combine headers and rows
        const csvContent = [headers.join(','), ...csvRows].join('\n');

        // Create a blob with BOM for Excel UTF-8 compatibility
        const blob = new Blob(['\uFEFF' + csvContent], { type: 'text/csv;charset=utf-8;' });
        const link = document.createElement('a');
        const url = URL.createObjectURL(blob);

        link.setAttribute('href', url);
        link.setAttribute('download', `transactions_${new Date().toISOString().split('T')[0]}.csv`);
        link.style.visibility = 'hidden';

        document.body.appendChild(link);
        link.click();
        document.body.removeChild(link);
    };



    return (
        <nav className="fixed top-0 left-0 right-0 z-50 bg-white/80 backdrop-blur-md border-b border-indigo-100 shadow-sm">
            <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
                <div className="flex justify-between items-center h-16">
                    {/* Logo & Brand */}
                    <div className="flex items-center gap-3">
                        <div className="relative group">
                            <div className="absolute -inset-0.5 bg-gradient-to-r from-blue-600 to-indigo-600 rounded-xl blur opacity-30 group-hover:opacity-60 transition duration-500"></div>
                            <div className="relative p-2 bg-gradient-to-br from-white to-gray-50 rounded-xl border border-white/50 shadow-sm flex items-center justify-center">
                                {/* Custom Abstract Logo: "D" + "P" Finance Shape */}
                                <svg width="24" height="24" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg" className="text-indigo-600">
                                    <path d="M19 7V17C19 19.2091 17.2091 21 15 21H7C4.79086 21 3 19.2091 3 17V7C3 4.79086 4.79086 3 7 3H13C16.3137 3 19 5.68629 19 9Z" stroke="currentColor" strokeWidth="2" className="text-indigo-600" />
                                    <path d="M13 3V11C13 12.1046 13.8954 13 15 13H21" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="text-blue-500" />
                                    <circle cx="16.5" cy="8.5" r="1.5" fill="currentColor" className="text-blue-500" />
                                </svg>
                            </div>
                        </div>
                        <div className="flex flex-col -space-y-1">
                            <span className="text-lg font-bold tracking-tight text-gray-900">
                                Fin<span className="text-indigo-600">ura</span>
                            </span>
                            <span className="text-[10px] font-medium text-gray-400 tracking-widest uppercase ml-0.5">
                                Dashboard
                            </span>
                        </div>
                    </div>

                    {/* Desktop Navigation */}
                    <div className="hidden md:flex items-center space-x-4">
                        <button
                            onClick={handleExportCSV}
                            className="flex items-center space-x-2 px-4 py-2 text-sm font-medium text-indigo-600 bg-indigo-50 hover:bg-indigo-100 rounded-lg transition-all duration-200"
                            title="Export to CSV"
                        >
                            <Download className="h-4 w-4" />
                            <span>Export Data</span>
                        </button>

                        <div className="h-6 w-px bg-gray-200 mx-2"></div>

                        {/* User Profile Dropdown */}
                        <div className="relative">
                            <button
                                onClick={() => setIsProfileMenuOpen(!isProfileMenuOpen)}
                                className="flex items-center space-x-2 p-1 rounded-full border border-transparent hover:border-gray-200 transition-all focus:outline-none"
                            >
                                {currentUser?.photoURL ? (
                                    <img
                                        src={currentUser.photoURL}
                                        alt="Profile"
                                        className="h-9 w-9 rounded-full object-cover border border-gray-200 shadow-sm"
                                    />
                                ) : (
                                    <div className="h-9 w-9 rounded-full bg-indigo-100 flex items-center justify-center text-indigo-600 border border-indigo-200">
                                        <UserIcon className="h-5 w-5" />
                                    </div>
                                )}
                            </button>

                            {/* Dropdown Menu */}
                            {isProfileMenuOpen && (
                                <div className="absolute right-0 mt-2 w-56 bg-white rounded-xl shadow-lg border border-gray-100 py-2 z-50 ring-1 ring-black ring-opacity-5 transform transition-all">
                                    <div className="px-4 py-2 border-b border-gray-50">
                                        <p className="text-xs text-gray-500 uppercase tracking-wider font-semibold">Signed in as</p>
                                        <p className="text-sm font-medium text-gray-900 truncate">{currentUser?.email}</p>
                                    </div>

                                    <div className="border-t border-gray-100 mt-1 pt-1">
                                        <button
                                            onClick={handleLogout}
                                            className="w-full text-left px-4 py-2 text-sm text-red-600 hover:bg-red-50 flex items-center space-x-2"
                                        >
                                            <LogOut className="h-4 w-4" />
                                            <span>Sign Out</span>
                                        </button>
                                    </div>
                                </div>
                            )}
                        </div>
                    </div>

                    {/* Mobile Menu Button */}
                    <div className="md:hidden flex items-center gap-3">
                        {/* Mobile Avatar (Non-clickable, just display) */}
                        {currentUser?.photoURL ? (
                            <img
                                src={currentUser.photoURL}
                                alt="Profile"
                                className="h-8 w-8 rounded-full object-cover border border-gray-200"
                            />
                        ) : null}

                        <button
                            onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
                            className="p-2 rounded-lg text-gray-500 hover:bg-gray-100 transition-colors"
                        >
                            {isMobileMenuOpen ? <X className="h-6 w-6" /> : <Menu className="h-6 w-6" />}
                        </button>
                    </div>
                </div>
            </div>

            {/* Hidden Input for File Upload - Moved outside for stability */}


            {/* Mobile Menu */}
            {isMobileMenuOpen && (
                <div className="md:hidden border-t border-gray-100 bg-white/95 backdrop-blur-xl absolute w-full left-0 shadow-lg">
                    <div className="px-4 py-4 space-y-3">
                        <div className="flex items-center space-x-3 px-2 py-3 bg-gray-50 rounded-lg mb-2">
                            {currentUser?.photoURL ? (
                                <img src={currentUser.photoURL} alt="Profile" className="h-10 w-10 rounded-full object-cover bg-white" />
                            ) : (
                                <div className="h-10 w-10 rounded-full bg-indigo-100 flex items-center justify-center text-indigo-600">
                                    <UserIcon className="h-5 w-5" />
                                </div>
                            )}
                            <div className="overflow-hidden">
                                <p className="text-sm font-medium text-gray-900 truncate">{currentUser?.email}</p>

                            </div>
                        </div>

                        <button
                            onClick={() => {
                                handleExportCSV();
                                setIsMobileMenuOpen(false);
                            }}
                            className="w-full flex items-center justify-between px-4 py-3 text-sm font-medium text-indigo-600 bg-indigo-50 hover:bg-indigo-100 rounded-xl transition-colors"
                        >
                            <span className="flex items-center">
                                <FileSpreadsheet className="h-5 w-5 mr-3" />
                                Export CSV
                            </span>
                            <Download className="h-4 w-4" />
                        </button>

                        <div className="h-px bg-gray-100 my-2"></div>

                        <button
                            onClick={handleLogout}
                            className="w-full flex items-center justify-center space-x-2 px-4 py-3 text-sm font-medium text-red-600 bg-red-50 hover:bg-red-100 rounded-xl transition-colors"
                        >
                            <LogOut className="h-5 w-5" />
                            <span>Sign Out of Account</span>
                        </button>
                    </div>
                </div>
            )}
        </nav>
    );
};

export default Navbar;
