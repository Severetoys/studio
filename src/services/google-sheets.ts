
'use server';
/**
 * @fileOverview Service to interact with the Google Sheets API.
 * This file contains the logic to authenticate, add, and update data in a specific spreadsheet.
 * It uses the application's default credentials via the Firebase Admin SDK for authentication.
 */

import { google } from 'googleapis';
import { adminApp } from '@/lib/firebase-admin'; // Use a single, initialized admin app instance.

// Interface to define the structure of the data to be added to the sheet.
export interface SheetRow {
    timestamp: string;
    name: string;
    email: string;
    phone: string;
    imageId: string; 
    videoBase64: string;
    paymentId: string;
}

// The ID of your Google Sheet.
const SPREADSHEET_ID = '1sGkcINE6NtCfHuxybqyHpR03aG1wwatqfwRBhm7A1W4';

// The name of the tab within your spreadsheet.
const TAB_NAME = 'cliente';

// Define the expected columns. The order is crucial.
const COLUMN_ORDER: (keyof SheetRow)[] = ['timestamp', 'name', 'email', 'phone', 'imageId', 'videoBase64', 'paymentId'];
const IMAGE_ID_COLUMN_INDEX = 4; // Corresponds to "Imagem ID (Base64)"
const EMAIL_COLUMN_INDEX = 2; 
const PAYMENT_ID_COLUMN_INDEX = 6;


/**
 * Creates an authenticated instance of the Google Sheets API using the app's default credentials.
 * @returns The Sheets API instance.
 */
function getSheetsClient() {
    try {
        const auth = new google.auth.GoogleAuth({
            scopes: ['https://www.googleapis.com/auth/spreadsheets'],
            credential: adminApp.options.credential,
        });
        return google.sheets({ version: 'v4', auth });
    } catch (error: any) {
        console.error('Error initializing Google Sheets client:', error);
        throw new Error('Failed to authenticate with the Google Sheets API using application default credentials.');
    }
}

/**
 * Appends a new row to a Google Sheet.
 * @param rowData The data to be added to the row.
 */
export async function appendToSheet(rowData: SheetRow): Promise<void> {
    try {
        const sheets = getSheetsClient();
        const values = [COLUMN_ORDER.map(key => rowData[key])];

        await sheets.spreadsheets.values.append({
            spreadsheetId: SPREADSHEET_ID,
            range: `${TAB_NAME}!A:G`,
            valueInputOption: 'USER_ENTERED',
            requestBody: {
                values,
            },
        });
        console.log('Data added to the spreadsheet successfully.');
    } catch (error: any) {
        console.error('Error adding data to Google Sheet:', error.message);
        if (error.response?.data?.error) {
            console.error('API Error Details:', error.response.data.error);
        }
        throw new Error('Failed to communicate with the Google Sheets API. Ensure the service account has Editor permissions on the sheet.');
    }
}

/**
 * Retrieves all stored user images (as base64 strings) from the sheet.
 * @returns An array of base64 encoded image strings.
 */
export async function getAllUserImages(): Promise<string[]> {
    try {
        const sheets = getSheetsClient();
        const range = `${TAB_NAME}!E2:E`; // Column E is 'imageId'

        const getResponse = await sheets.spreadsheets.values.get({
            spreadsheetId: SPREADSHEET_ID,
            range: range,
        });

        const rows = getResponse.data.values;
        if (!rows || rows.length === 0) {
            return [];
        }

        // Flatten the array and filter out any empty or invalid entries.
        const images = rows.flat().filter(img => typeof img === 'string' && img.startsWith('data:image'));
        return images;

    } catch (error: any) {
        console.error('Error reading images from Google Sheet:', error.message);
        if (error.response?.data?.error) {
            console.error('API Error Details:', error.response.data.error);
        }
        throw new Error('Failed to communicate with the Google Sheets API during image retrieval.');
    }
}

/**
 * Finds a user by email and updates their payment ID.
 * If the user does not exist, a new one is created.
 * @param email The email of the user to update.
 * @param paymentId The payment ID to set.
 * @param name The name of the user (used if creating a new user).
 */
export async function updatePaymentIdForUser(email: string, paymentId: string, name: string): Promise<void> {
    try {
        const sheets = getSheetsClient();
        const getResponse = await sheets.spreadsheets.values.get({
            spreadsheetId: SPREADSHEET_ID,
            range: `${TAB_NAME}`,
        });

        const rows = getResponse.data.values;
        if (!rows || rows.length < 1) {
            const newUser: SheetRow = { timestamp: new Date().toISOString(), name, email, phone: '', imageId: '', videoBase64: '', paymentId };
            return await appendToSheet(newUser);
        }
        
        let userRowIndex = -1;
        for (let i = 1; i < rows.length; i++) {
            if (rows[i][EMAIL_COLUMN_INDEX] === email) {
                userRowIndex = i;
                break;
            }
        }

        if (userRowIndex !== -1) {
            const rangeToUpdate = `${TAB_NAME}!G${userRowIndex + 1}`; // G is paymentId column
            await sheets.spreadsheets.values.update({
                spreadsheetId: SPREADSHEET_ID,
                range: rangeToUpdate,
                valueInputOption: 'USER_ENTERED',
                requestBody: { values: [[paymentId]] },
            });
            console.log(`Payment ID for ${email} updated successfully.`);
        } else {
             const newUser: SheetRow = { timestamp: new Date().toISOString(), name, email, phone: '', imageId: '', videoBase64: '', paymentId };
            await appendToSheet(newUser);
            console.log(`New user created for ${email} with payment ID.`);
        }
    } catch (error: any) {
        console.error('Error updating or adding user in Google Sheet:', error.message);
        if (error.response?.data?.error) {
            console.error('API Error Details:', error.response.data.error);
        }
        throw new Error('Failed to update Google Sheet with payment information.');
    }
}
