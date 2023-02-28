import express from 'express';
import bodyParser from 'body-parser';
import TelegramBot from 'node-telegram-bot-api';
import { OpenAIApi } from 'openai';

import { config } from 'dotenv';
config();

const YOUR_OPENAI_API_KEY = process.env.YOUR_OPENAI_API_KEY;
const YOUR_BOT_TOKEN = process.env.YOUR_BOT_TOKEN;

// Create a new Telegram bot instance with your bot token
const bot = new TelegramBot(YOUR_BOT_TOKEN, { polling: false });

// Create a new OpenAI API client instance with your API key

const openai = new OpenAIApi({
    apiKey: YOUR_OPENAI_API_KEY,
});

// Create a new Express.js application
const app = express();

// Use body-parser middleware to parse incoming JSON requests
app.use(bodyParser.json());

app.get('/euggrush-tg-bot', (req, res) => {
    res.send('here is euggrush telegram bot');
});

// Define a route to handle incoming webhook requests from Telegram

app.post(`/euggrush-tg-bot`, (req, res) => {
    // Process the incoming message using your bot's `on` method
    console.log(req.body);

    bot.processUpdate(req.body);
    res.sendStatus(200);
});

// Start the Express.js application on port 3333
app.listen(3333, () => {
    console.log('Express.js server running on port 3333');
});

// Handle incoming messages with the bot's `on` method

bot.on('message', async (msg) => {
    // Generate a response using ChatGPT
    const prompt = `User: ${msg.text}\nChatGPT:`;
    const response = await openai.complete({
        engine: 'davinci',
        prompt,
        maxTokens: 150,
        n: 1,
        stop: '\n',
    });

    // Extract the generated response text from the API response
    const generatedText = response.data.choices[0].text.trim();

    // Respond to the user's message with the generated response
    bot.sendMessage(msg.chat.id, generatedText);
});
