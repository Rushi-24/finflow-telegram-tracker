
# FinFlow Telegram Bot

This is a Node.js server that runs a Telegram bot for the FinFlow application. The bot allows users to add transactions to Firestore by sending messages in a specific format.

## Setup Instructions

1. **Create a Telegram Bot**:
   - Open Telegram and search for "BotFather"
   - Send the command `/newbot` and follow the instructions
   - BotFather will give you a bot token - copy this token

2. **Set Environment Variables**:
   - Add your Telegram bot token to the `.env` file as `TELEGRAM_BOT_TOKEN`

3. **Setup Firebase Service Account**:
   - Go to your Firebase project console
   - Navigate to Project Settings > Service accounts
   - Click "Generate new private key"
   - Replace the contents of `serviceAccount.json` with the downloaded JSON

4. **Install Dependencies**:
   ```bash
   npm install
   ```

5. **Start the Server**:
   ```bash
   node telegramBot.js
   ```

## Usage

Once the bot is running, users can interact with it by sending messages in this format:
```
Category Amount
```

Example:
```
Food 200
```

This will create a new transaction in the Firestore database with:
- Category: Food
- Amount: 200
- Timestamp: Current time
- ChatId: User's Telegram chat ID

## Integration with FinFlow

This bot connects to the same Firestore database as the FinFlow web application. To link transactions with specific FinFlow users, you can modify the code to use a mapping between Telegram chat IDs and FinFlow user IDs.
