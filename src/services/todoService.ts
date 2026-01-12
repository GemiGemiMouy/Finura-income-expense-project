import {
    collection,
    addDoc,
    updateDoc,
    deleteDoc,
    doc,
    onSnapshot,
    query,
    orderBy,
    serverTimestamp,
    Timestamp
} from 'firebase/firestore';
import { db } from '../firebase/config';

export interface Todo {
    id: string;
    text: string;
    completed: boolean;
    createdAt: any;
}

export const logTodoError = (error: unknown, context: string) => {
    console.error(`Error in ${context}:`, error);
};

// Add a new todo
export const addTodo = async (userId: string, text: string): Promise<void> => {
    try {
        await addDoc(collection(db, 'users', userId, 'todos'), {
            text,
            completed: false,
            createdAt: serverTimestamp()
        });
    } catch (error) {
        logTodoError(error, 'addTodo');
        throw error;
    }
};

// Subscribe to todos
export const subscribeToTodos = (
    userId: string,
    callback: (todos: Todo[]) => void
) => {
    const todosRef = collection(db, 'users', userId, 'todos');
    const q = query(todosRef, orderBy('createdAt', 'desc'));

    return onSnapshot(q, (snapshot) => {
        const todos = snapshot.docs.map(doc => ({
            id: doc.id,
            ...doc.data()
        } as Todo));
        callback(todos);
    });
};

// Toggle todo completion
export const toggleTodo = async (userId: string, todoId: string, currentStatus: boolean): Promise<void> => {
    try {
        const todoRef = doc(db, 'users', userId, 'todos', todoId);
        await updateDoc(todoRef, {
            completed: !currentStatus
        });
    } catch (error) {
        logTodoError(error, 'toggleTodo');
        throw error;
    }
};

// Delete todo
export const deleteTodo = async (userId: string, todoId: string): Promise<void> => {
    try {
        const todoRef = doc(db, 'users', userId, 'todos', todoId);
        await deleteDoc(todoRef);
    } catch (error) {
        logTodoError(error, 'deleteTodo');
        throw error;
    }
};
