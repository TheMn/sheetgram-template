import { Update } from '@grammyjs/types';
import { addSheetData, getSheetData } from './sheets';
import { TelegramAPI } from './telegram';

/**
 * Handles the incoming update from Telegram.
 * @param update The Telegram update object.
 */
const handleUpdate = (update: Update) => {
  if (!update.message || !update.message.text) {
    return;
  }

  const message = update.message;
  const text = message.text;
  const chatId = message.chat.id;

  // Command handling
  if (text.startsWith('/start')) {
    const response = 'Welcome!\n\nUse /add <text> to add a new row to the sheet, or /list to view all data.';
    TelegramAPI.call('sendMessage', { chat_id: chatId, text: response });
  } else if (text.startsWith('/add')) {
    const content = text.substring('/add'.length).trim();
    if (!content) {
      TelegramAPI.call('sendMessage', { chat_id: chatId, text: 'Please provide text to add. Usage: /add <your text>' });
      return;
    }
    try {
      addSheetData([new Date().toISOString(), message.from?.username || 'unknown_user', content]);
      TelegramAPI.call('sendMessage', { chat_id: chatId, text: 'Data added successfully!' });
    } catch (error) {
      console.error('Failed to add data:', error);
      TelegramAPI.call('sendMessage', { chat_id: chatId, text: 'An error occurred while adding your data.' });
    }
  } else if (text.startsWith('/list')) {
    try {
      const data = getSheetData();
      if (!data || data.length === 0) {
        TelegramAPI.call('sendMessage', { chat_id: chatId, text: 'The sheet is empty.' });
        return;
      }
      const messageText = data.map(row => row.join(' | ')).join('\n');
      TelegramAPI.call('sendMessage', { chat_id: chatId, text: `<pre>${messageText}</pre>`, parse_mode: 'HTML' });
    } catch (error) {
      console.error('Failed to retrieve data:', error);
      TelegramAPI.call('sendMessage', { chat_id: chatId, text: 'An error occurred while retrieving data.' });
    }
  }
};

// --- Webhook & Global Functions ---

const doPost = (e: GoogleAppsScript.Events.DoPost) => {
  try {
    const update: Update = JSON.parse(e.postData.contents);
    handleUpdate(update);
  } catch (error) {
    console.error('Error in doPost:', error);
  }
};

const setWebhook = () => {
  const webAppUrl = ScriptApp.getService().getUrl();
  const response = TelegramAPI.call('setWebhook', { url: webAppUrl });
  console.log(response);
};

const getBotInfo = () => {
  const response = TelegramAPI.call('getMe');
  console.log(response);
};

// Expose global functions
(global as any).doPost = doPost;
(global as any).setWebhook = setWebhook;
(global as any).getBotInfo = getBotInfo;
