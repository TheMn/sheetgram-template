import { DATA_WEBSITE_URL, HASH_PROPERTY_KEY } from "./vars";
import { notifyChange } from "./helpers";

/**
 * Computes the SHA-256 hash of a string.
 * @param input The string to hash.
 * @returns The SHA-256 hash as a hex string.
 */
function computeHash(input: string): string {
  const hash = Utilities.computeDigest(Utilities.DigestAlgorithm.SHA_256, input);
  return hash.map(byte => ('0' + (byte & 0xFF).toString(16)).slice(-2)).join('');
}

/**
 * Checks a website for content changes by comparing its hash with a stored hash.
 * Notifies via Telegram if a change is detected.
 */
export function checkForUpdates() {
  const scriptProperties = PropertiesService.getScriptProperties();
  const storedHash = scriptProperties.getProperty(HASH_PROPERTY_KEY);

  const response = UrlFetchApp.fetch(DATA_WEBSITE_URL, { muteHttpExceptions: true });
  const content = response.getContentText();
  const newHash = computeHash(content);

  if (newHash !== storedHash) {
    scriptProperties.setProperty(HASH_PROPERTY_KEY, newHash);

    const message = `Website content has changed. New hash: ${newHash}`;
    notifyChange(message);

    // Also log to the Apps Script logger
    Logger.log(message);
  } else {
    Logger.log("No changes detected.");
  }
}