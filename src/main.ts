import { Message, Update } from "@grammyjs/types";
import { CHANNEL_ID, GROUP_ID, OPENROUTER_API_KEY, WEBAPP_URL } from "./vars";
import { handleUserMessage } from "./users";
import { notifyError } from "./helpers";
import { TelegramAPI } from "./telegram";
import { categorizeText } from "./agent";

function setWebhook() {
  const response = TelegramAPI.call("setWebhook", {
    url: WEBAPP_URL,
    allowed_updates: ["channel_post", "edited_channel_post"]
  });
  console.log(`setWebhookResponse: ${response}`);
}

function doPost(e: GoogleAppsScript.Events.DoPost) {
  try {
    const contents: Update = JSON.parse(e.postData.contents);

    const channel_post: Update.Channel & Message | null = contents.channel_post || null;

    if (CHANNEL_ID.substring(1) != channel_post?.chat?.username) {
      // Ignore messages not from the specified channel
      return;
    }

    const categories = categorizeText("the vs course is held 15 mins late. regards ar.", OPENROUTER_API_KEY);
    TelegramAPI.call("sendMessage", {
      chat_id: GROUP_ID,
      text: JSON.stringify(categories) || "No categories found",
      parse_mode: "HTML"
    });

  } catch (error) {
    notifyError(error);
  }
}
