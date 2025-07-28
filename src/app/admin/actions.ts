
'use server';
/**
 * @fileOverview Server-side actions for the admin dashboard.
 */

import { adminApp } from '@/lib/firebase-admin';
import { getDatabase } from 'firebase-admin/database';
import { getFirestore } from 'firebase-admin/firestore';

const db = getDatabase(adminApp);
const firestore = getFirestore(adminApp);

interface DashboardStats {
  totalSubscribers: number;
  totalConversations: number;
  totalProducts: number;
  pendingReviews: number;
}

/**
 * Retrieves statistics for the admin dashboard.
 * @returns A promise that resolves with the dashboard statistics.
 */
export async function getDashboardStats(): Promise<DashboardStats> {
  try {
    // Get total subscribers from Realtime Database
    const subscribersRef = db.ref('facialAuth/users');
    const subscribersSnapshot = await subscribersRef.once('value');
    const totalSubscribers = subscribersSnapshot.exists() ? subscribersSnapshot.numChildren() : 0;

    // Get total conversations from Realtime Database
    const conversationsRef = db.ref('chats');
    const conversationsSnapshot = await conversationsRef.once('value');
    const totalConversations = conversationsSnapshot.exists() ? conversationsSnapshot.numChildren() : 0;

    // Get total products from Firestore
    const productsSnapshot = await firestore.collection('products').count().get();
    const totalProducts = productsSnapshot.data().count;

    // Get pending reviews from Firestore
    const pendingReviewsSnapshot = await firestore.collection('reviews').where('status', '==', 'pending').count().get();
    const pendingReviews = pendingReviewsSnapshot.data().count;

    return {
      totalSubscribers,
      totalConversations,
      totalProducts,
      pendingReviews,
    };
  } catch (error) {
    console.error("Error fetching dashboard stats:", error);
    // Return zeroed stats on error to prevent crashing the dashboard
    return {
      totalSubscribers: 0,
      totalConversations: 0,
      totalProducts: 0,
      pendingReviews: 0,
    };
  }
}
