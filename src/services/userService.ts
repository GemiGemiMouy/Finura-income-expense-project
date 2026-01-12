import { doc, getDoc, setDoc } from 'firebase/firestore';
import { db } from '../firebase/config';

export interface UserSettings {
    dailyLimit: number;
}

export const DEFAULT_DAILY_LIMIT = 1000;

export const getUserSettings = async (uid: string): Promise<UserSettings> => {
    try {
        const userRef = doc(db, 'users', uid);
        const userSnap = await getDoc(userRef);

        if (userSnap.exists()) {
            const data = userSnap.data();
            return {
                dailyLimit: data.dailyLimit || DEFAULT_DAILY_LIMIT
            };
        } else {
            // Initialize default settings if user doc doesn't exist
            await setDoc(userRef, { dailyLimit: DEFAULT_DAILY_LIMIT }, { merge: true });
            return { dailyLimit: DEFAULT_DAILY_LIMIT };
        }
    } catch (error) {
        console.error('Error fetching user settings:', error);
        return { dailyLimit: DEFAULT_DAILY_LIMIT };
    }
};

export const updateUserSettings = async (uid: string, settings: Partial<UserSettings>): Promise<void> => {
    try {
        const userRef = doc(db, 'users', uid);
        await setDoc(userRef, settings, { merge: true });
    } catch (error) {
        console.error('Error updating user settings:', error);
        throw error;
    }
};
