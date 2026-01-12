import React, { useState, useEffect } from 'react';
import { useAuth } from '../contexts/AuthContext';
import { addTodo, subscribeToTodos, toggleTodo, deleteTodo, Todo } from '../services/todoService';
import { CheckSquare, Square, Trash2, Plus, ListTodo } from 'lucide-react';

const TodoList: React.FC = () => {
    const { currentUser } = useAuth();
    const [todos, setTodos] = useState<Todo[]>([]);
    const [newTodo, setNewTodo] = useState('');
    const [isLoading, setIsLoading] = useState(true);

    useEffect(() => {
        if (currentUser) {
            const unsubscribe = subscribeToTodos(currentUser.uid, (data) => {
                setTodos(data);
                setIsLoading(false);
            });
            return () => unsubscribe();
        }
    }, [currentUser]);

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        if (!newTodo.trim() || !currentUser) return;

        try {
            await addTodo(currentUser.uid, newTodo.trim());
            setNewTodo('');
        } catch (error) {
            console.error('Failed to add todo', error);
        }
    };

    const handleToggle = async (todo: Todo) => {
        if (!currentUser) return;
        try {
            await toggleTodo(currentUser.uid, todo.id, todo.completed);
        } catch (error) {
            console.error('Failed to toggle todo', error);
        }
    };

    const handleDelete = async (id: string) => {
        if (!currentUser) return;
        try {
            await deleteTodo(currentUser.uid, id);
        } catch (error) {
            console.error('Failed to delete todo', error);
        }
    };

    return (
        <div className="bg-gradient-to-br from-white/95 to-orange-50/80 backdrop-blur-md rounded-3xl shadow-xl border border-orange-100/50 overflow-hidden h-full">
            <div className="bg-gradient-to-r from-orange-100/90 to-amber-100/90 px-8 py-6 relative overflow-hidden">
                <div className="absolute inset-0 bg-gradient-to-r from-orange-100/30 to-amber-100/30"></div>
                <div className="relative z-10">
                    <h2 className="text-2xl font-bold text-orange-800 flex items-center">
                        <ListTodo className="mr-3 h-7 w-7 text-orange-600" />
                        Financial Goals
                    </h2>
                    <p className="text-orange-600 text-sm mt-2">Track your financial to-dos</p>
                </div>
            </div>

            <div className="p-6">
                <form onSubmit={handleSubmit} className="mb-6 relative">
                    <input
                        type="text"
                        value={newTodo}
                        onChange={(e) => setNewTodo(e.target.value)}
                        placeholder="Add new goal..."
                        className="w-full pl-4 pr-12 py-3 border border-orange-200 rounded-xl focus:ring-2 focus:ring-orange-400 focus:border-transparent bg-white/80 backdrop-blur-sm transition-all"
                    />
                    <button
                        type="submit"
                        disabled={!newTodo.trim()}
                        className="absolute right-2 top-1/2 -translate-y-1/2 p-1.5 bg-orange-500 text-white rounded-lg hover:bg-orange-600 disabled:opacity-50 disabled:cursor-not-allowed transition-colors shadow-sm"
                    >
                        <Plus className="h-5 w-5" />
                    </button>
                </form>

                <div className="space-y-3 max-h-[400px] overflow-y-auto pr-2 custom-scrollbar">
                    {todos.length === 0 && !isLoading ? (
                        <div className="text-center py-8 text-gray-500">
                            <p>No goals yet. Start by adding one!</p>
                        </div>
                    ) : (
                        todos.map((todo) => (
                            <div
                                key={todo.id}
                                className={`group flex items-center justify-between p-3 rounded-xl border transition-all duration-200 ${todo.completed
                                        ? 'bg-gray-50 border-gray-100'
                                        : 'bg-white border-orange-100 hover:border-orange-200 shadow-sm'
                                    }`}
                            >
                                <div className="flex items-center gap-3 flex-1 min-w-0">
                                    <button
                                        onClick={() => handleToggle(todo)}
                                        className={`flex-shrink-0 transition-colors ${todo.completed ? 'text-green-500' : 'text-gray-400 hover:text-orange-500'
                                            }`}
                                    >
                                        {todo.completed ? (
                                            <CheckSquare className="h-5 w-5" />
                                        ) : (
                                            <Square className="h-5 w-5" />
                                        )}
                                    </button>
                                    <span
                                        className={`truncate text-sm font-medium transition-all ${todo.completed ? 'text-gray-400 line-through' : 'text-gray-700'
                                            }`}
                                    >
                                        {todo.text}
                                    </span>
                                </div>
                                <button
                                    onClick={() => handleDelete(todo.id)}
                                    className="ml-3 p-1.5 text-gray-300 hover:text-red-500 hover:bg-red-50 rounded-lg opacity-0 group-hover:opacity-100 transition-all"
                                >
                                    <Trash2 className="h-4 w-4" />
                                </button>
                            </div>
                        ))
                    )}
                </div>
            </div>
        </div>
    );
};

export default TodoList;
