import express from 'express';
import bodyParser from 'body-parser';
import TelegramBot from 'node-telegram-bot-api';
import fetch from 'node-fetch';
import { config } from 'dotenv';

import { Configuration, OpenAIApi } from 'openai';

config();

const PORT = process.env.PORT || 3333;
const BOT_TOKEN = process.env.TELEGRAM_API_TOKEN;
const OPENAI_API_KEY = process.env.OPENAI_API_KEY;

const configuration = new Configuration({
    organization: `org-WeLnbfOiob7WoLEsKkr0mCfu`,
    apiKey: OPENAI_API_KEY,
});

const openai = new OpenAIApi(configuration);
const bot = new TelegramBot(BOT_TOKEN, { polling: true });
const app = express();

app.use(bodyParser.json());

app.get('/euggrush-tg-bot', (req, res) => {
    res.send('here is euggrush telegram bot');
});

app.post(`/euggrush-tg-bot`, (req, res) => {
    bot.processUpdate(req.body);
    res.sendStatus(200);
});

app.listen(PORT, () => {
    console.log(`Express.js server running on port ${PORT}`);
});

const menu = [
    [
        { text: 'Joke', callback_data: 'joke' },
        { text: 'Talk to Bot ', callback_data: 'chatgpt' }
    ],
];

bot.onText(/\/start/, (msg) => {
    bot.sendMessage(msg.chat.id, 'Choose an option:', {
        reply_markup: { inline_keyboard: menu }
    });
});

const getChatGpt = async (msg) => {
    const prompt = `User: ${msg.text}\nChatGPT:`;
    let request = JSON.stringify({ model: 'text-davinci-003', prompt });
    const response = await openai.createCompletion(request);
    const generatedText = response.data.choices[0].text.trim();
    return generatedText;
};

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

bot.on('callback_query', async (callbackQuery) => {
    const chatId = callbackQuery.message.chat.id;
    const button = callbackQuery.data;

    if (button == `joke`) {
        let joke = await getJoke();
        bot.sendMessage(chatId, joke).then(() => {
            bot.sendMessage(chatId, 'Choose an option:', {
                reply_markup: { inline_keyboard: menu }
            });
        });
    } else if (button == `chatgpt`) {
        let chat = await getChatGpt(`hi`);
        bot.sendMessage(chatId, chat).then(() => {
            bot.sendMessage(chatId, 'Choose an option:', {
                reply_markup: { inline_keyboard: menu }
            });
        });
    }
});

bot.on('message', async (msg) => {
    const generatedText = await getChatGpt(msg);
    bot.sendMessage(msg.chat.id, generatedText);
});
