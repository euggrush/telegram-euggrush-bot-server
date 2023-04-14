import express from 'express';
import bodyParser from 'body-parser';
import TelegramBot from 'node-telegram-bot-api';
import fetch from 'node-fetch';
import {
    config
} from 'dotenv';
config();

const PORT = process.env.PORT || 3333;
const BOT_TOKEN = process.env.TELEGRAM_API_TOKEN;
const OPENAI_API_KEY = process.env.OPENAI_API_KEY;

// Create a new Telegram bot instance with your bot token
const bot = new TelegramBot(BOT_TOKEN, {
    polling: true
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
app.listen(PORT, () => {
    console.log(`Express.js server running on port ${PORT}`);
});

// Define the menu buttons
const menu = [
    [
        {
            text: 'Joke',
            callback_data: 'joke'
        },
        {
            text: 'Talk to Bot ',
            callback_data: 'chatgpt'
        }
    ],
    // [
    //     {
    //         text: 'Button 3',
    //         callback_data: 'button3'
    //     },
    //     {
    //         text: 'Button 4',
    //         callback_data: 'button4'
    //     }
    // ]
];

// Respond to the /start command with the menu
bot.onText(/\/start/, (msg) => {
    bot.sendMessage(msg.chat.id, 'Choose an option:', {
        reply_markup: {
            inline_keyboard: menu
        }
    });
});

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
    return generatedText;
};

// Get some jokes
const getJoke = async () => {
    try {
        const response = await fetch('https://v2.jokeapi.dev/joke/Any');
        const data = await response.json();
        return data.joke;
    } catch (error) {
        console.log(`Error: ${error}`);
        return `Sorry, no joke today`;
    }
};

// Handle button presses
bot.on('callback_query', async (callbackQuery) => {
    const chatId = callbackQuery.message.chat.id;
    const button = callbackQuery.data;

    if (button == `joke`) {
        let joke = await getJoke();
        bot.sendMessage(chatId, joke).then(() => {
            bot.sendMessage(chatId, 'Choose an option:', {
                reply_markup: {
                    inline_keyboard: menu
                }
            });
        });
    } else if (button == `chatgpt`) {
        let chat = await getChatGpt(`hi`);
        bot.sendMessage(chatId, chat).then(() => {
            bot.sendMessage(chatId, 'Choose an option:', {
                reply_markup: {
                    inline_keyboard: menu
                }
            });
        });
    }
});

// Handle incoming messages with the bot's `on` method
bot.on('message', async (msg) => {
    const generatedText = await getChatGpt(msg);
    bot.sendMessage(msg.chat.id, generatedText);
});

