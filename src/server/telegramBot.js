
require('dotenv').config();
const TelegramBot = require('node-telegram-bot-api');
const admin = require('firebase-admin');
const express = require('express');
const serviceAccount = require('./serviceAccount.json');

// Initialize Firebase Admin
admin.initializeApp({
  credential: admin.credential.cert(serviceAccount)
});

const db = admin.firestore();

// Create a bot instance
const bot = new TelegramBot(process.env.TELEGRAM_BOT_TOKEN, { polling: true });

// Setup Express server
const app = express();
const PORT = process.env.PORT || 3000;

app.get('/', (req, res) => {
  res.send('FinFlow Telegram Bot Server is running');
});

// Handle incoming messages
bot.on('message', async (msg) => {
  const chatId = msg.chat.id;
  const text = msg.text.trim();
  
  // Check if message matches the pattern: Category Amount
  const regex = /^([a-zA-Z]+)\s+(\d+(\.\d+)?)$/;
  const match = text.match(regex);
  
  if (match) {
    try {
      const category = match[1];
      const amount = parseFloat(match[2]);
      
      // Store in Firestore
      await db.collection('transactions').add({
        chatId: chatId,
        category: category,
        amount: amount,
        timestamp: admin.firestore.FieldValue.serverTimestamp(),
        userId: `telegram_${chatId}`, // Adding a userId field to link with specific users
        type: 'expense', // Default to expense
        description: `Added via Telegram: ${category} ${amount}`
      });
      
      // Send confirmation
      bot.sendMessage(
        chatId, 
        `✅ Transaction added!\nCategory: ${category}\nAmount: ${amount}`
      );
    } catch (error) {
      console.error('Error storing transaction:', error);
      bot.sendMessage(
        chatId, 
        '❌ Error saving your transaction. Please try again.'
      );
    }
  } else {
    // Check for specific commands
    if (text.startsWith('/start')) {
      bot.sendMessage(
        chatId,
        'Welcome to FinFlow Bot! 👋\n\nTo add a transaction, simply send a message in this format:\n\nCategory Amount\n\nFor example:\nFood 200\nTransport 50.5\nRent 1500'
      );
    } else {
      // Format instructions
      bot.sendMessage(
        chatId,
        'Please use the format: Category Amount\n\nExamples:\nFood 200\nTransport 50.5'
      );
    }
  }
});

// Start the server
app.listen(PORT, () => {
  console.log(`Server is running on port ${PORT}`);
});

console.log('FinFlow Telegram Bot is running...');
