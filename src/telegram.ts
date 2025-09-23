import { getErrorMessage } from "./helpers";
import { TELEGRAM_URL } from "./vars";
import { ApiMethods } from "@grammyjs/types";

type Methods = ApiMethods<never>;

export const TelegramAPI = (function () {
  /**
   * Sends a POST request to the Telegram API and logs the response.
   *
   * @param endpoint - The Telegram API method to call (e.g., "sendMessage").
   * @param params - The parameters for the API call.
   */
  function call<T extends keyof Methods>(
    endpoint: T,
    params: Parameters<Methods[T]>[0],
  ): ReturnType<Methods[T]> {
    var url = TELEGRAM_URL + "/" + endpoint;

    try {
      var response = UrlFetchApp.fetch(url, {
        method: "post",
        contentType: "application/json",
        payload: JSON.stringify(params),
      });
      return JSON.parse(response.getContentText());
    } catch (error) {
      // Throw a meaningful error to be caught by the caller
      throw new Error("Telegram API Error: " + getErrorMessage(error));
    }
  }

  // Exposing public functions
  return {
    call,
  };
})();
