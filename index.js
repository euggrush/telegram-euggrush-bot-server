import express from 'express';
import bodyParser from 'body-parser';
import TelegramBot from 'node-telegram-bot-api';
import fetch from 'node-fetch';
import {
    config
} from 'dotenv';
config();

const BOT_TOKEN = process.env.TELEGRAM_API_TOKEN;
const OPENAI_API_KEY = process.env.OPENAI_API_KEY;

// Create a new Telegram bot instance with your bot token
const bot = new TelegramBot(BOT_TOKEN, {
    polling: false
});

import {
    Configuration,
    OpenAIApi
} from 'openai';

const configuration = new Configuration({
    organization: `org-WeLnbfOiob7WoLEsKkr0mCfu`,
    apiKey: OPENAI_API_KEY,
});
const openai = new OpenAIApi(configuration);

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
    bot.processUpdate(req.body);
    res.sendStatus(200);
});

// Start the Express.js application on port 3333
app.listen(3333, () => {
    console.log('Express.js server running on port 3333');
});

// Define the menu buttons
const menu = [
    [
        {
            text: 'Joke',
            callback_data: 'joke'
        },
        {
            text: 'Button 2',
            callback_data: 'button2'
        }
    ],
    [
        {
            text: 'Button 3',
            callback_data: 'button3'
        },
        {
            text: 'Button 4',
            callback_data: 'button4'
        }
    ]
];

// Respond to the /start command with the menu
bot.onText(/\/start/, (msg) => {
    bot.sendMessage(msg.chat.id, 'Choose an option:', {
        reply_markup: {
            inline_keyboard: menu
        }
    });
});

const getJoke = async (msg) => {
    try {
        const response = await fetch('https://v2.jokeapi.dev/joke/Any');
        const data = await response.json();
        if (data.type === 'single') {
            bot.sendMessage(msg.chat.id, data.joke);
        } else if (data.type === 'twopart') {
            bot.sendMessage(msg.chat.id, `${data.setup}\n\n${data.delivery}`);
        }
    } catch (error) {
        console.error(error);
        bot.sendMessage(msg.chat.id, 'Sorry, I could not generate a joke at this time.');
    }
};

const getChatGpt = async (msg) => {
    // Generate a response using ChatGPT
    const prompt = `User: ${msg.text}\nChatGPT:`;

    let request = JSON.stringify({
        model: 'text-davinci-003',
        prompt
    })
    const response = await openai.createCompletion(request);

    // Extract the generated response text from the API response
    const generatedText = response.data.choices[0].text.trim();

    // Respond to the user's message with the generated response
    bot.sendMessage(msg.chat.id, generatedText);
};

// Handle incoming messages with the bot's `on` method
bot.on('message', async (msg) => {
    // If the message contains the word "joke", generate a joke using the JokeAPI
    if (msg.text && msg.text.toLowerCase().includes('joke')) {
        getJoke(msg);
    } else {
        getChatGpt(msg);
    }
});

// Handle button presses
bot.on('callback_query', (callbackQuery) => {
    const chatId = callbackQuery.message.chat.id;
    const button = callbackQuery.data;

    bot.sendMessage(chatId, `You pressed button ${button}`);
});