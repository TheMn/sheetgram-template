import { Message } from "@grammyjs/types";
import { getText } from "./helpers";
import { MSG_WELCOME } from "./vars";
import { TelegramAPI } from "./telegram";

export function handleCommands(message: Message) {
  const messageText = getText(message);

  switch (messageText) {
    case "/start":
      cmdStart(message);
      break;
  }
}

function cmdStart(message: Message) {
  TelegramAPI.call("sendInvoice", {
    chat_id: message.chat.id,
    currency: "XTR",
    title: "فروش استار",
    description:
      "با زدن روی دکمه زیر می‌توانید استارهای خود را نقد کنید. ارزش ریالی استارها به کیف پول شما افزوده می‌شود.",
    payload: "test",
    prices: [
      {
        amount: 1,
        label: "label",
      },
    ],
  });
}
