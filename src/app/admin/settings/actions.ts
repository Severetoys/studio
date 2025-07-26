
'use server';
/**
 * @fileOverview Server-side actions for managing profile settings.
 * These functions read from and write to the Firebase Realtime Database.
 */

import { adminApp } from '@/lib/firebase-admin';
import { getDatabase } from 'firebase-admin/database';

export interface ProfileSettings {
    name: string;
    phone: string;
    email: string;
    address: string;
    profilePictureUrl: string;
    coverPhotoUrl: string;
    galleryPhotos: { url: string }[];
}

const db = getDatabase(adminApp);
const settingsRef = db.ref('admin/profileSettings');

/**
 * Saves the profile settings to the Firebase Realtime Database.
 * @param settings The profile settings object to save.
 * @returns A promise that resolves when the settings are saved.
 */
export async function saveProfileSettings(settings: ProfileSettings): Promise<void> {
  try {
    await settingsRef.set(settings);
    console.log("Profile settings saved successfully.");
  } catch (error: any) {
    console.error("Error saving profile settings:", error);
    throw new Error("Failed to save settings to the database.");
  }
}

/**
 * Retrieves the profile settings from the Firebase Realtime Database.
 * @returns A promise that resolves with the profile settings object, or null if not found.
 */
export async function getProfileSettings(): Promise<ProfileSettings | null> {
  try {
    const snapshot = await settingsRef.once('value');
    if (snapshot.exists()) {
      console.log("Profile settings loaded successfully.");
      return snapshot.val() as ProfileSettings;
    }
    console.log("No profile settings found in the database.");
    return null;
  } catch (error: any) {
    console.error("Error getting profile settings:", error);
    throw new Error("Failed to retrieve settings from the database.");
  }
}
