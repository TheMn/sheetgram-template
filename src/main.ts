import { Message } from "@grammyjs/types";
import { GROUP_ID, WEBAPP_URL } from "./vars";
import { handleUserMessage } from "./users";
import { notifyError } from "./helpers";
import { TelegramAPI } from "./telegram";

function setWebhook() {
  const response = TelegramAPI.call("setWebhook", {
    url: WEBAPP_URL,
  });
  console.log(`setWebhookResponse: ${response}`);
}

function doPost(e: GoogleAppsScript.Events.DoPost) {
  try {
    const contents = JSON.parse(e.postData.contents);

    const message: Message | null = contents.message;

    if (!message) {
      return;
    }

    if (message.chat.type === "private") {
      handleUserMessage(message);
      return;
    }
  } catch (error) {
    notifyError(error);
  }
}
