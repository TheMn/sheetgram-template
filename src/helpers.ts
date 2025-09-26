import { Message } from "@grammyjs/types";
import { GROUP_ID, THREAD_LOGS_ID } from "./vars";
import { TelegramAPI } from "./telegram";

export const escapeMD = (text: string) =>
  text.replace(/[_*[\]()~`>#+\-=|{}.!]/g, "\\$&");

export function getErrorMessage(error: unknown) {
  if (error instanceof Error) return error.message;
  return String(error);
}

/**
 * A concise error logger for Telegram.
 * Place your primary code inside the 'try' block.
 */
export function notifyError(error: any) {
  try {
    // Construct the error message
    const errorMessage = `🚨 *Bot Error*
*Message:* ${escapeMD(error.message)}
*File:* ${escapeMD(error.fileName)}
*Line:* ${error.lineNumber}
*Stack:*
\`\`\`
${escapeMD(error.stack)}
\`\`\``.substring(0, 4096); // Truncate to Telegram's message limit

    try {
      TelegramAPI.call("sendMessage", {
        chat_id: GROUP_ID,
        message_thread_id: THREAD_LOGS_ID,
        text: errorMessage,
        parse_mode: "MarkdownV2",
      });
    } catch (apiError) {
      // Fallback if Telegram fails: log to the built-in Apps Script logger
      Logger.log(
        `CRITICAL: Failed to send error to Telegram. Original Error: ${error.message}. API Error: ${getErrorMessage(apiError)}`,
      );
    }
  } catch (e) {
    Logger.log(
      `Failed to notify ${error.message}, because of ${getErrorMessage(e)}`,
    );
  }
}

export function getText(telegramMessage: Message) {
  return telegramMessage.text || telegramMessage.caption || "Default Text";
}
