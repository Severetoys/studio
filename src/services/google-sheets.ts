
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
    imageId: string;
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
 * Atualiza o ID de pagamento para um usuário específico, identificado pelo email.
 * @param email O email do usuário a ser atualizado.
 * @param paymentId O novo ID de pagamento a ser inserido.
 */
export async function updatePaymentIdForUser(email: string, paymentId: string): Promise<void> {
    try {
        const sheets = getSheetsClient();

        // 1. Encontrar a linha do usuário pelo email.
        const getResponse = await sheets.spreadsheets.values.get({
            spreadsheetId: SPREADSHEET_ID,
            range: `${SHEET_NAME}!A:F`, // Lê todo o intervalo para encontrar o email.
        });

        const rows = getResponse.data.values;
        if (!rows || rows.length === 0) {
            console.log('Nenhum dado encontrado na planilha.');
            throw new Error(`Usuário com email ${email} não encontrado na planilha.`);
        }

        const rowIndex = rows.findIndex(row => row[EMAIL_COLUMN_INDEX] === email);

        if (rowIndex === -1) {
            console.log(`Email ${email} não encontrado nas linhas.`);
            throw new Error(`Usuário com email ${email} não encontrado na planilha.`);
        }

        // A API retorna índice baseado em 0, mas a planilha é baseada em 1.
        const sheetRowNumber = rowIndex + 1;

        // 2. Atualizar a célula do ID de pagamento na linha encontrada.
        const updateRange = `${SHEET_NAME}!${PAYMENT_ID_COLUMN_LETTER}${sheetRowNumber}`;

        const updateResponse = await sheets.spreadsheets.values.update({
            spreadsheetId: SPREADSHEET_ID,
            range: updateRange,
            valueInputOption: 'RAW', // Usa RAW para inserir o ID de pagamento como string literal.
            requestBody: {
                values: [[paymentId]],
            },
        });

        console.log('ID de pagamento atualizado com sucesso:', updateResponse.data);

    } catch (error: any) {
        console.error('Erro ao atualizar o ID de pagamento na Planilha Google:', error.message);
        if (error.response?.data?.error) {
            console.error('Detalhes do erro da API:', error.response.data.error);
        }
        throw new Error('Falha ao atualizar a planilha com o ID de pagamento.');
    }
}
