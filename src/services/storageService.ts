import { storage } from '../firebase/config';
import { ref, uploadBytes, getDownloadURL, deleteObject } from 'firebase/storage';

/**
 * Uploads a user's profile picture to Firebase Storage and returns the download URL.
 * Path: users/{userId}/profile.jpg
 */
export const uploadProfilePicture = async (userId: string, file: File): Promise<string> => {
    try {
        // Create a reference to 'users/{userId}/profile.jpg'
        const storageRef = ref(storage, `users/${userId}/profile.jpg`);

        // Upload the file
        const snapshot = await uploadBytes(storageRef, file);

        // Get the download URL
        const downloadURL = await getDownloadURL(snapshot.ref);
        return downloadURL;
    } catch (error) {
        console.error("Error uploading profile picture:", error);
        throw error;
    }
};

/**
 * Deletes a user's profile picture from Firebase Storage.
 * Path: users/{userId}/profile.jpg
 */
export const deleteProfilePicture = async (userId: string): Promise<void> => {
    try {
        const storageRef = ref(storage, `users/${userId}/profile.jpg`);
        await deleteObject(storageRef);
    } catch (error: any) {
        // Ignore "object-not-found" error if user tries to delete but file is gone
        if (error.code !== 'storage/object-not-found') {
            console.error("Error deleting profile picture:", error);
            throw error;
        }
    }
};
