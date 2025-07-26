
'use server';
/**
 * @fileOverview Server-side actions for managing user reviews.
 */

import { adminApp } from '@/lib/firebase-admin';
import { getFirestore, FieldValue } from 'firebase-admin/firestore';

export interface Review {
    id: string;
    author: string;
    text: string;
    status: 'pending' | 'approved' | 'rejected';
    createdAt: string; 
    reply?: {
        author: string;
        text: string;
        isVerified: boolean;
        createdAt: string;
    };
}

const db = getFirestore(adminApp);
const reviewsCollection = db.collection('reviews');

/**
 * Retrieves all reviews from Firestore, ordered by creation date.
 * @returns An array of review objects.
 */
export async function getAllReviews(): Promise<Review[]> {
    try {
        const snapshot = await reviewsCollection.orderBy('createdAt', 'desc').get();
        
        if (snapshot.empty) {
            console.log("No reviews found.");
            return [];
        }

        const reviews: Review[] = snapshot.docs.map(doc => {
            const data = doc.data();
            return {
                id: doc.id,
                author: data.author,
                text: data.text,
                status: data.status || 'pending',
                // Convert Firestore Timestamp to ISO string
                createdAt: data.createdAt?.toDate ? data.createdAt.toDate().toISOString() : new Date().toISOString(),
                reply: data.reply ? {
                    ...data.reply,
                    createdAt: data.reply.createdAt?.toDate ? data.reply.createdAt.toDate().toISOString() : new Date().toISOString(),
                } : undefined
            };
        });

        return reviews;
    } catch (error: any) {
        console.error("Error fetching reviews:", error);
        throw new Error("Failed to retrieve reviews from the database.");
    }
}


/**
 * Updates the status of a specific review.
 * @param reviewId The ID of the review to update.
 * @param status The new status ('approved' or 'rejected').
 * @returns A promise that resolves with a success or error message.
 */
export async function updateReviewStatus(reviewId: string, status: 'approved' | 'rejected'): Promise<{ success: boolean; message: string }> {
    try {
        const reviewRef = reviewsCollection.doc(reviewId);
        await reviewRef.update({ status: status });
        const message = `Avaliação ${status === 'approved' ? 'aprovada' : 'rejeitada'} com sucesso.`;
        console.log(message);
        return { success: true, message };
    } catch (error: any) {
        const errorMessage = `Erro ao atualizar a avaliação: ${error.message}`;
        console.error(errorMessage);
        return { success: false, message: errorMessage };
    }
}
