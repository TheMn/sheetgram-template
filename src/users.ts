import { Message } from "@grammyjs/types";
import { getText } from "./helpers";
import { handleCommands } from "./commands";

export function handleUserMessage(message: Message) {
  // Call the API to check membership status
  // const chatMember = TelegramAPI.call('getChatMember', {
  //   chat_id: CHANNEL_ID,
  //   user_id: message.chat.id
  // });

  // Check if the user is allowed
  // if (!isMemberAllowed(chatMember)) {
  //   // If not, send only the required message and stop.
  //   TelegramAPI.call('sendMessage', {
  //     chat_id: message.chat.id,
  //     text: MSG_SHOULD_JOIN_FIRST
  //   });
  //   return;
  // }

  if (getText(message).startsWith("/")) {
    handleCommands(message);
  }
}

// function isMemberAllowed(chatMemberResponse) {
//   if (!chatMemberResponse || !chatMemberResponse.ok) {
//     return false;
//   }
//   const status = chatMemberResponse.result.status;
//   return ALLOWED_STATUSES.includes(status);
// }
