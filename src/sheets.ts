import { getErrorMessage } from "./helpers";
import { SPREADSHEET_ID } from "./vars";

/**
 * A manager for Google Sheets that reads data once, processes it
 * in memory as an array of objects, and writes all changes back in a single batch operation.
 */
export class SheetsManager {
  private static spreadsheet: GoogleAppsScript.Spreadsheet.Spreadsheet | null =
    null;
  private static cache: Record<
    string,
    {
      headers: string[];
      items: Array<Record<string, any>>;
      sheet: GoogleAppsScript.Spreadsheet.Sheet;
      isDirty: boolean;
    }
  > = {}; // Caches sheet data: { sheetName: { sheet, headers, items, isDirty } }

  // Gets the main Spreadsheet object.
  private static getSpreadsheet() {
    if (!this.spreadsheet) {
      try {
        this.spreadsheet = SpreadsheetApp.openById(SPREADSHEET_ID);
      } catch (e) {
        Logger.log(
          `FATAL: Could not open spreadsheet. Error: ${getErrorMessage(e)}`,
        );
      }
    }
    return this.spreadsheet;
  }

  // Reads sheet data and converts it to an array of objects. This runs only ONCE per sheet.
  private static loadSheetData(sheetName: string) {
    if (this.cache[sheetName]) return this.cache[sheetName];

    const sheet = this.getSpreadsheet()?.getSheetByName(sheetName);
    if (!sheet) return null;

    const values = sheet.getDataRange().getValues();
    const headers = values?.length ? values.shift()!.map(String) : [];
    const items = values.map((row) =>
      headers.reduce((obj, header, i) => {
        obj[header] = row[i];
        return obj;
      }, {} as any),
    );

    this.cache[sheetName] = { sheet, headers, items, isDirty: false };
    return this.cache[sheetName];
  }

  // --- Public Read Operations (Instant after first load) ---

  /**
   * Gets all data from a sheet as an array of objects.
   * @param sheetName The name of the sheet.
   * @returns The array of item objects or null.
   */
  static getItems(sheetName: string) {
    return this.loadSheetData(sheetName)?.items ?? null;
  }

  /**
   * Finds the first item matching a key-value pair.
   * @param sheetName The name of the sheet.
   * @param keyName The header/property to search by.
   * @param keyValue The value to match.
   * @returns The found item object or undefined.
   */
  static findRecord(sheetName: string, keyName: string, keyValue: any) {
    const items = this.getItems(sheetName);
    return items?.find((item) => String(item[keyName]) === String(keyValue));
  }

  // --- Public Write Operations (Modify the local array, super fast) ---

  /**
   * Deletes all items matching a key-value pair from the local array.
   * Marks the sheet as needing to be saved.
   */
  static deleteRecord(sheetName: string, keyName: string, keyValue: any) {
    const sheetData = this.loadSheetData(sheetName);
    if (!sheetData) return this;

    const initialLength = sheetData.items.length;
    sheetData.items = sheetData.items.filter(
      (item) => String(item[keyName]) !== String(keyValue),
    );

    if (sheetData.items.length < initialLength) {
      sheetData.isDirty = true;
    }
    return this; // Enable chaining: SheetsManager.deleteRecord(...).upsertRecord(...)
  }

  /**
   * Updates an existing item or inserts a new one into the local array.
   * Marks the sheet as needing to be saved.
   */
  static upsertRecord(sheetName: string, keyName: string, itemObject: any) {
    const sheetData = this.loadSheetData(sheetName);
    if (!sheetData || !itemObject[keyName]) return this;

    const index = sheetData.items.findIndex(
      (item) => String(item[keyName]) === String(itemObject[keyName]),
    );

    if (index !== -1) {
      // Update existing item
      sheetData.items[index] = { ...sheetData.items[index], ...itemObject };
    } else {
      // Insert new item
      sheetData.items.push(itemObject);
    }
    sheetData.isDirty = true;
    return this;
  }

  // --- The Final Write Operation ---

  /**
   * Writes all modified data from the cache back to the spreadsheet.
   * This is the ONLY function that performs slow write operations.
   */
  static commit() {
    SpreadsheetApp.flush(); // Applies all pending spreadsheet changes.
    for (const sheetName in this.cache) {
      const sheetData = this.cache[sheetName];
      if (sheetData.isDirty) {
        const { sheet, headers, items } = sheetData;

        // Convert array of objects back to a 2D array for writing
        const newValues = items.map((item) =>
          headers.map((header) => item[header] ?? ""),
        );

        // Add headers back to the very top of our data array
        newValues.unshift(headers);

        // Clear the entire sheet and write the new data in one go
        sheet.getDataRange().clearContent();

        if (newValues.length > 0) {
          sheet
            .getRange(1, 1, newValues.length, newValues[0].length)
            .setValues(newValues);
        }

        Logger.log(`✅ Committed ${items.length} rows to sheet: ${sheetName}`);
        sheetData.isDirty = false; // Reset the flag after saving
      }
    }
  }
}
