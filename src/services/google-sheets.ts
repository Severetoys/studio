
'use server';
/**
 * @fileOverview Service to interact with the Google Sheets API.
 * This file contains the logic to authenticate, add, and update data in a specific spreadsheet.
 */

import { google } from 'googleapis';
import serviceAccount from '../../serviceAccountKey.json';

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
 * Creates an authenticated instance of the Google Sheets API.
 * @returns The Sheets API instance.
 */
function getSheetsClient() {
    if (!serviceAccount || !serviceAccount.client_email || !serviceAccount.private_key) {
        throw new Error("Service account credentials (serviceAccountKey.json) are missing or incomplete.");
    }
    try {
        const auth = new google.auth.GoogleAuth({
            credentials: {
                client_email: serviceAccount.client_email,
                private_key: serviceAccount.private_key,
            },
            scopes: ['https://www.googleapis.com/auth/spreadsheets'],
        });
        return google.sheets({ version: 'v4', auth });
    } catch (error: any) {
        console.error('Error initializing Google Sheets client:', error);
        throw new Error('Failed to authenticate with the Google Sheets API.');
    }
}

/**
 * Appends a new row to a Google Sheet.
 * @param rowData The data to be added to the row.
 */
export async function appendToSheet(rowData: SheetRow): Promise<void> {
    try {
        const sheets = getSheetsClient();
        // Ensure the data is in the correct column order.
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
        throw new Error('Failed to communicate with the Google Sheets API.');
    }
}

/**
 * Finds if any user with a stored image exists.
 * This is a simplified check based on the user's script logic.
 * @returns A boolean indicating if a user with an image was found.
 */
export async function findUserInSheet(): Promise<boolean> {
    try {
        const sheets = getSheetsClient();
        // Get all data from the sheet
        const getResponse = await sheets.spreadsheets.values.get({
            spreadsheetId: SPREADSHEET_ID,
            range: `${TAB_NAME}`,
        });

        const rows = getResponse.data.values;
        if (!rows || rows.length < 2) { // < 2 because the first row is headers
            return false;
        }

        // Check each row (skipping headers) to see if an imageId is present.
        for (let i = 1; i < rows.length; i++) {
            const row = rows[i];
            const imageId = row[IMAGE_ID_COLUMN_INDEX];
            // If we find any row with a non-empty imageId, return true.
            if (imageId && imageId.length > 50) { // A base64 string will be long
                return true;
            }
        }

        return false;
    } catch (error: any) {
        console.error('Error reading from Google Sheet:', error.message);
        if (error.response?.data?.error) {
            console.error('API Error Details:', error.response.data.error);
        }
        throw new Error('Failed to communicate with the Google Sheets API during verification.');
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
            // Sheet is empty, just append.
            const newUser: SheetRow = { timestamp: new Date().toISOString(), name, email, phone: '', imageId: '', videoBase64: '', paymentId };
            return await appendToSheet(newUser);
        }
        
        // Find user by email
        let userRowIndex = -1;
        for (let i = 1; i < rows.length; i++) {
            if (rows[i][EMAIL_COLUMN_INDEX] === email) {
                userRowIndex = i;
                break;
            }
        }

        if (userRowIndex !== -1) {
            // User found, update payment ID
            const rangeToUpdate = `${TAB_NAME}!G${userRowIndex + 1}`; // G is paymentId column
            await sheets.spreadsheets.values.update({
                spreadsheetId: SPREADSHEET_ID,
                range: rangeToUpdate,
                valueInputOption: 'USER_ENTERED',
                requestBody: { values: [[paymentId]] },
            });
            console.log(`Payment ID for ${email} updated successfully.`);
        } else {
            // User not found, create a new one
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
