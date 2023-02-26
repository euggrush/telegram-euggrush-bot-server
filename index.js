import axios from 'axios';
import {
    config
} from 'dotenv';
import express from 'express';
import {
    GoogleSpreadsheet
} from 'google-spreadsheet';

config();
const app = express();

const JOKE_API = 'https://v2.jokeapi.dev/joke/Programming?type=single';
const TELEGRAM_URI = `https://api.telegram.org/bot${process.env.TELEGRAM_API_TOKEN}/sendMessage`;

app.use(express.json());

app.use(
    express.urlencoded({
        extended: true
    })
);

const doc = new GoogleSpreadsheet(process.env.GOOGLE_SPREADSHEET_ID);

await doc.useServiceAccountAuth({
    client_email: process.env.GOOGLE_SERVICE_ACCOUNT_EMAIL,
    private_key: process.env.GOOGLE_PRIVATE_KEY.replace(/\\n/g, '\n')
});

app.get('/euggrush-tg-bot', (req, res) => {
    res.send('euggrush telegram bot')
});

app.post('/euggrush-tg-bot', async (req, res) => {

    const { message } = req.body;
    const messageText = message?.text?.toLowerCase()?.trim();
    const chatId = message?.chat?.id;
    if (!messageText || !chatId) {
        return res.sendStatus(400)
    };

    let responseText = 'I have nothing to say.';

    if (messageText === 'joke') {
        try {
            const response = await axios(JOKE_API) || `Нету шуток`;
            responseText = response.data.joke;
        } catch (e) {
            console.log(e)
            res.send(e)
        }
    } else if (/\d\d\.\d\d/.test(messageText)) {
        responseText =
            dataFromSpreadsheet[messageText] || 'You have nothing to do on this day.'
    };

    try {
        await axios.post(TELEGRAM_URI, {
            chat_id: chatId,
            text: responseText
        })
        res.send('Done')
    } catch (e) {
        console.log(e)
        res.send(e)
    }
});

const PORT = process.env.PORT || 3333;

app.listen(PORT, () => {
    console.log(`Server running on port ${PORT}`)
});