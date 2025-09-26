export const scriptProperties = PropertiesService.getScriptProperties();
export const TELEGRAM_TOKEN = scriptProperties.getProperty("TELEGRAM_TOKEN");
export const TELEGRAM_URL = "https://api.telegram.org/bot" + TELEGRAM_TOKEN;
export const WEBAPP_URL = scriptProperties.getProperty("WEBAPP_URL")!;
export const SPREADSHEET_ID = scriptProperties.getProperty("SPREADSHEET_ID")!;
export const OPENROUTER_API_KEY = scriptProperties.getProperty("OPENROUTER_API_KEY")!;
// ----- ----- ----- ----- ----- ----- ----- ----- ----- ----- ----- ----- ----- ----- -----
export const CHANNEL_ID = "@genoadihu";

export const GROUP_ID = -1002957887308;
export const THREAD_LOGS_ID = 1;
// export const ALLOWED_STATUSES = ["member", "creator", "administrator"];

// ----- ----- ----- ----- ----- ----- ----- ----- ----- ----- ----- ----- ----- ----- -----
export const MSG_WELCOME = "سلام دوباره!";
export const MSG_SHOULD_JOIN_FIRST =
  "برای استفاده از خدمات این ربات، ابتدا باید در کانال @starpayapp عضو شوید.";
export const MSG_BANNED = "اجازه‌ی استفاده از امکانات این ربات را نداری.";

export const ERR_CANT_BE_EMPTY = "متن دستور نمی‌تواند خالی باشد!";
