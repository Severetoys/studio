
'use server';
/**
 * @fileOverview Server-side actions for managing registered users (subscribers).
 */

import { adminApp } from '@/lib/firebase-admin';
import { getDatabase } from 'firebase-admin/database';
import { getStorage } from 'firebase-admin/storage';

export interface RegisteredUser {
    id: string;
    name: string;
    email: string;
    phone: string;
    imageUrl: string;
    storagePath: string;
    createdAt: string;
}

const db = getDatabase(adminApp);
const storage = getStorage(adminApp);
const bucket = storage.bucket('authkit-y9vjx.appspot.com');

/**
 * Retrieves all registered users from the Realtime Database.
 * @returns An array of user objects.
 */
export async function getAllUsers(): Promise<RegisteredUser[]> {
    const usersRef = db.ref('facialAuth/users');
    const snapshot = await usersRef.once('value');
    
    if (!snapshot.exists()) {
        console.log("No users found in facialAuth/users path.");
        return [];
    }

    const usersData = snapshot.val();
    const usersList = Object.keys(usersData).map(key => ({
        id: key,
        ...usersData[key],
    }));

    // Sort by creation date, newest first
    usersList.sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime());

    console.log(`Found ${usersList.length} users in the database.`);
    return usersList;
}

/**
 * Deletes a user from the Realtime Database and their image from Storage.
 * @param {object} payload - The user ID and storage path.
 * @param {string} payload.userId - The ID of the user to delete.
 * @param {string} payload.storagePath - The path to the user's image in Firebase Storage.
 * @returns A promise that resolves with a success or error message.
 */
export async function deleteUser({ userId, storagePath }: { userId: string, storagePath: string }): Promise<{ success: boolean; message: string }> {
    try {
        // Delete from Realtime Database
        const userRef = db.ref(`facialAuth/users/${userId}`);
        await userRef.remove();

        // Delete from Storage
        if (storagePath && storagePath.startsWith('italosantos.com/')) {
            const fileRef = bucket.file(storagePath);
            await fileRef.delete();
        }

        const message = "Assinante removido com sucesso.";
        console.log(message);
        return { success: true, message };

    } catch (error: any) {
        const errorMessage = `Erro ao remover assinante: ${error.message}`;
        console.error(errorMessage);
        return { success: false, message: errorMessage };
    }
}
