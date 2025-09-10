import { ApiMethods } from '@grammyjs/types';

const BOT_TOKEN = PropertiesService.getScriptProperties().getProperty('BOT_TOKEN');
if (!BOT_TOKEN) {
  throw new Error("Bot token not found. Please set the 'BOT_TOKEN' script property.");
}

const TELEGRAM_URL = `https://api.telegram.org/bot${BOT_TOKEN}`;

/**
 * A simple Telegram API client that uses UrlFetchApp.
 */
export const TelegramAPI = {
  /**
   * Calls a Telegram Bot API method.
   * @param method The API method to call.
   * @param params The parameters for the method.
   * @returns The JSON response from the Telegram API.
   */
  call<T extends keyof ApiMethods<never>>(
    method: T,
    params?: Parameters<ApiMethods<never>[T]>[0]
  ): ReturnType<ApiMethods<never>[T]> {
    const response = UrlFetchApp.fetch(`${TELEGRAM_URL}/${method}`, {
      method: 'post',
      contentType: 'application/json',
      payload: JSON.stringify(params || {}),
      muteHttpExceptions: true,
    });

    return JSON.parse(response.getContentText());
  },
};
