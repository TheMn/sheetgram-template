// --- Spreadsheet Configuration ---

// Get the active spreadsheet that the script is bound to.
const spreadsheet = SpreadsheetApp.getActiveSpreadsheet();

// Get the sheet name from script properties. A default name 'Database' is used if not set.
const SHEET_NAME = PropertiesService.getScriptProperties().getProperty('SHEET_NAME') || 'Database';

/**
 * Gets the sheet object by name. If the sheet does not exist, it creates it
 * and adds a header row. This makes the bot's setup process more automated.
 * @returns {GoogleAppsScript.Spreadsheet.Sheet} The sheet object.
 */
const getSheet = (): GoogleAppsScript.Spreadsheet.Sheet => {
    let sheet = spreadsheet.getSheetByName(SHEET_NAME);
    if (!sheet) {
        sheet = spreadsheet.insertSheet(SHEET_NAME);
        // Define headers for the sheet to give it structure.
        sheet.appendRow(['Timestamp', 'Username', 'Text']);
    }
    return sheet;
}

// --- Public Functions ---

/**
 * Retrieves all data from the designated sheet, excluding the header row.
 * @returns {any[][]} A 2D array representing the rows and columns of data.
 */
export const getSheetData = (): any[][] => {
    const sheet = getSheet();
    // Get all data from the sheet.
    const allData = sheet.getDataRange().getValues();
    // Remove the header row (the first element) before returning.
    return allData.slice(1);
};

/**
 * Appends a new row of data to the end of the sheet.
 * @param {any[]} rowData - An array of values (e.g., [timestamp, username, text]).
 */
export const addSheetData = (rowData: any[]): void => {
    const sheet = getSheet();
    sheet.appendRow(rowData);
};
