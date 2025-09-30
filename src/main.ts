import { Message, Update } from "@grammyjs/types";
import { CHANNEL_ID, GROUP_ID, OPENROUTER_API_KEY, WEBAPP_URL } from "./vars";
import { notifyError } from "./helpers";
import { TelegramAPI } from "./telegram";
import { categorizeText } from "./agent";
import { CATALOG } from "./catalog"; // Import the new catalog
import { checkForUpdates } from "./data-watcher";

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

    const text = channel_post.text || channel_post.caption || "Digital Humanities Master Program";
    const categories = categorizeText(text, OPENROUTER_API_KEY);

    categories.forEach(categoryId => {
      // Determine the correct thread ID for either the program or a specific course
      if (categoryId === 11945) {
        TelegramAPI.call("forwardMessage", {
          chat_id: GROUP_ID,
          from_chat_id: CHANNEL_ID,
          message_id: channel_post.message_id,
        });
      } else {
        TelegramAPI.call("forwardMessage", {
          chat_id: GROUP_ID,
          message_thread_id: CATALOG.courses[categoryId]?.telegram_thread_id,
          from_chat_id: CHANNEL_ID,
          message_id: channel_post.message_id,
        });

      }
    });

  } catch (error) {
    notifyError(error);
  }
}

// ----- ----- ----- ----- ----- ----- ----- ----- ----- ----- ----- ----- ----- ----- -----
// Data Watcher Functions

/**
 * A function to be called by a time-based trigger to check for website updates.
 */
function runHealthCheck() {
  try {
    Logger.log("Running health check...");
    checkForUpdates();
    Logger.log("Health check finished.");
  } catch (error) {
    notifyError(error);
  }
}

/**
 * Sets up a time-based trigger for the health check.
 * Deletes existing triggers to prevent duplicates.
 * The user should run this function once from the script editor.
 */
function setup() {
  // Delete all existing triggers to avoid duplicates
  const allTriggers = ScriptApp.getProjectTriggers();
  for (const trigger of allTriggers) {
    ScriptApp.deleteTrigger(trigger);
  }

  // Create a new trigger to run the health check every 10 minutes
  ScriptApp.newTrigger("runHealthCheck")
    .timeBased()
    .everyMinutes(10)
    .create();

  Logger.log("Time-based trigger for runHealthCheck created successfully. It will run every 10 minutes.");
}
