# Sheetgram Template

This project is a template for a Telegram bot built with TypeScript and Google Apps Script. It's designed to be customized for various functionalities like managing user interactions with Google Sheets.

## Features
*(Customize based on your needs)*

## Technologies Used

*   **TypeScript:** The primary language for the bot's logic.
*   **Google Apps Script:** The platform for hosting and running the bot.
*   **esbuild:** A fast bundler for compiling the TypeScript code into a single JavaScript file for Google Apps Script.
*   **clasp:** The command-line tool for managing Google Apps Script projects.
*   **Grammy:** The bot is built using the Grammy framework for creating Telegram bots.

## Project Structure

```
.
├── .clasp.json
├── .gitignore
├── dist
│   └── appsscript.json
├── package-lock.json
├── package.json
├── scripts
│   └── deploy.sh
├── src
│   ├── commands.ts
│   ├── helpers.ts
│   ├── main.ts
│   ├── sheets.ts
│   ├── telegram.ts
│   ├── users.ts
│   └── vars.ts
└── tsconfig.json
```

*   `src/main.ts`: The main entry point for the bot. It handles incoming webhooks and routes messages to the appropriate handlers.
*   `src/telegram.ts`: A wrapper for the Telegram Bot API, making it easier to send messages and perform other actions.
*   `src/sheets.ts`: A manager for interacting with the Google Sheet. It provides a simple way to read, write, and update data.
*   `src/users.ts`: Handles messages from users, including checking for membership in a specific channel.
*   `src/commands.ts`: Defines and handles the bot's commands.
*   `src/helpers.ts`: Contains utility functions for things like escaping Markdown and logging errors.
*   `src/vars.ts`: Stores constants and configuration variables, such as API keys and group IDs.
*   `scripts/deploy.sh`: A script for building and deploying the bot to Google Apps Script.
*   `.clasp.json`: The configuration file for the `clasp` command-line tool.
*   `package.json`: The project's dependencies and scripts.
*   `tsconfig.json`: The configuration file for the TypeScript compiler.

## Getting Started

### Prerequisites

*   [Node.js](https://nodejs.org/) and [Yarn](https://yarnpkg.com/)
*   [Google Apps Script CLI (clasp)](https://github.com/google/clasp)

### Installation

1.  Clone the repository:

    ```bash
    git clone https://github.com/heokhe/starpay.git
    cd starpay
    ```

2.  Install the dependencies:

    ```bash
    yarn install
    ```

3.  Log in to your Google account with `clasp`:

    ```bash
    clasp login
    ```

4.  Create a new Google Apps Script project or clone an existing one. If you're creating a new project, you'll need to create a new Google Sheet as well.

5.  Update the `scriptId` in `.clasp.json` with the ID of your Google Apps Script project.

### Usage

Use the following commands:

- `yarn build`: Build the TypeScript code into JavaScript for deployment.

- `yarn start`: Run the built application locally for testing (note: may require adjustments for GAS APIs).

- `yarn deploy`: Build and deploy to Google Apps Script using clasp.

### Configuration

You'll need to set the following script properties in your Google Apps Script project:

*   `TELEGRAM_TOKEN`: Your Telegram bot token (if applicable).
*   `WEBAPP_URL`: The URL of your deployed web app.
*   `SPREADSHEET_ID`: The ID of your Google Sheet.

You can set these properties in the Google Apps Script editor under **Project Settings > Script Properties**.

## Running the Project

To build and deploy the project, run the following command:

```bash
npm run deploy
```

This will compile the TypeScript code, push it to your Google Apps Script project, and deploy a new version of your web app.

## How to Contribute

To add a new feature, such as a new command, you'll need to do the following:

1.  Add a new function to `src/commands.ts` to handle the command.
2.  Add a new case to the `switch` statement in `src/commands.ts` to call your new function.
3.  If your new command requires any new configuration variables, add them to `src/vars.ts`.
4.  If your new command needs to interact with the Google Sheet, use the `SheetsManager` class in `src/sheets.ts`.
5.  If your new command needs to send a message to Telegram, use the `TelegramAPI` class in `src/telegram.ts`.
6.  Once you've added your new feature, you can run `npm run deploy` to deploy it.
