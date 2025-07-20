
'use server';
/**
 * @fileOverview Serviço para interagir com a API do Google Sheets.
 * Este arquivo contém a lógica para autenticar, adicionar e atualizar dados em uma planilha específica.
 */

import { google } from 'googleapis';
import path from 'path';

// Interface para definir a estrutura dos dados a serem adicionados na planilha.
interface SheetRow {
    timestamp: string;
    name: string;
    email: string;
    imageId: string; // Para manter compatibilidade, mas pode ser preenchido como 'N/A' no registro via pagamento.
    videoBase64: string;
    paymentId: string;
}

// O ID da sua Planilha Google.
const SPREADSHEET_ID = '1XU5m0m2HHK9MFa9WoHdfZ26j1pW2bHfs41-5YjxWGmU';

// O nome da página/aba dentro da sua planilha.
const SHEET_NAME = 'Sheet1'; // ATENÇÃO: Mude para o nome correto da sua aba se for diferente.

// Define as colunas esperadas. A ordem é crucial.
const COLUMN_ORDER = ['timestamp', 'name', 'email', 'imageId', 'videoBase64', 'paymentId'];
const EMAIL_COLUMN_INDEX = 2; // Coluna 'C' é o índice 2 (base 0)
const PAYMENT_ID_COLUMN_LETTER = 'F';

/**
 * Cria uma instância autenticada da API do Google Sheets.
 * @returns A instância da API do Sheets.
 */
function getSheetsClient() {
    const auth = new google.auth.GoogleAuth({
        keyFile: path.resolve('./serviceAccountKey.json'),
        scopes: ['https://www.googleapis.com/auth/spreadsheets'],
    });
    return google.sheets({ version: 'v4', auth });
}


/**
 * Adiciona uma nova linha a uma Planilha Google.
 * @param rowData Os dados a serem adicionados na linha.
 */
export async function appendToSheet(rowData: SheetRow): Promise<void> {
    try {
        const sheets = getSheetsClient();
        const values = [COLUMN_ORDER.map(key => rowData[key as keyof SheetRow])];

        const response = await sheets.spreadsheets.values.append({
            spreadsheetId: SPREADSHEET_ID,
            range: `${SHEET_NAME}!A:F`,
            valueInputOption: 'USER_ENTERED',
            requestBody: {
                values: values,
            },
        });

        console.log('Dados adicionados à planilha com sucesso:', response.data);

    } catch (error: any) {
        console.error('Erro ao adicionar dados na Planilha Google:', error.message);
        if (error.response?.data?.error) {
            console.error('Detalhes do erro da API:', error.response.data.error);
        }
        throw new Error('Falha ao se comunicar com a API do Google Sheets.');
    }
}


/**
 * Atualiza o ID de pagamento para um usuário. Se o usuário não existir, cria uma nova linha.
 * @param email O email do usuário.
 * @param paymentId O ID de pagamento.
 * @param name O nome do usuário (para o caso de precisar criar uma nova linha).
 */
export async function updatePaymentIdForUser(email: string, paymentId: string, name: string): Promise<void> {
    try {
        const sheets = getSheetsClient();

        // 1. Tentar encontrar a linha do usuário pelo email.
        const getResponse = await sheets.spreadsheets.values.get({
            spreadsheetId: SPREADSHEET_ID,
            range: `${SHEET_NAME}!A:F`,
        });

        const rows = getResponse.data.values;
        const rowIndex = rows ? rows.findIndex(row => row[EMAIL_COLUMN_INDEX] === email) : -1;

        if (rowIndex !== -1) {
            // Usuário encontrado, atualiza o ID de pagamento.
            const sheetRowNumber = rowIndex + 1;
            const updateRange = `${SHEET_NAME}!${PAYMENT_ID_COLUMN_LETTER}${sheetRowNumber}`;

            await sheets.spreadsheets.values.update({
                spreadsheetId: SPREADSHEET_ID,
                range: updateRange,
                valueInputOption: 'RAW',
                requestBody: {
                    values: [[paymentId]],
                },
            });
            console.log(`ID de pagamento para ${email} atualizado para ${paymentId}.`);
        } else {
            // Usuário não encontrado, adiciona uma nova linha.
            console.log(`Email ${email} não encontrado. Criando novo registro de usuário.`);
            const newRow: SheetRow = {
                timestamp: new Date().toLocaleString('pt-BR', { timeZone: 'America/Sao_Paulo' }),
                name: name,
                email: email,
                imageId: 'N/A (Registro via Pagamento)',
                videoBase64: '',
                paymentId: paymentId,
            };
            await appendToSheet(newRow);
        }

    } catch (error: any) {
        console.error('Erro ao atualizar a Planilha Google:', error.message);
        if (error.response?.data?.error) {
            console.error('Detalhes do erro da API:', error.response.data.error);
        }
        throw new Error('Falha ao atualizar a planilha com os dados do pagamento.');
    }
}
