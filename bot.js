import dotenv from "dotenv";
import TelegramBot from "node-telegram-bot-api";
import axios from "axios";
import db from "./db.js";

dotenv.config();

// Проверяем, есть ли ключи API
if (!process.env.TELEGRAM_BOT_TOKEN || !process.env.GPT_API_KEY) {
    console.error("Ошибка: TELEGRAM_BOT_TOKEN или GPT_API_KEY не найдены в .env");
    process.exit(1);
}

const bot = new TelegramBot(process.env.TELEGRAM_BOT_TOKEN, {
    polling: true
});
const OPENAI_API_KEY = process.env.GPT_API_KEY;

// Команда /start
bot.onText(/\/start/, (msg) => {
    const chatId = msg.chat.id;
    const name = msg.chat.first_name || "Гость";

    try {
        // Проверяем, есть ли пользователь в базе
        const user = db.prepare("SELECT * FROM users WHERE telegram_id = ?").get(chatId);

        if (!user) {
            db.prepare("INSERT INTO users (telegram_id, name) VALUES (?, ?)").run(chatId, name);
            bot.sendMessage(chatId, `Привет, ${name}! Ты добавлен в базу.`);
        } else {
            bot.sendMessage(chatId, `С возвращением, ${name}!`);
        }
    } catch (error) {
        console.error("Ошибка базы данных:", error);
        bot.sendMessage(chatId, "Ошибка сервера. Попробуйте позже.");
    }
});

// Основная логика бота (общение с OpenAI)
bot.on("message", async (msg) => {
    const chatId = msg.chat.id;
    const userMessage = msg.text;

    // Игнорируем команды (они обрабатываются отдельно)
    if (userMessage.startsWith("/")) return;

    try {
        const response = await axios.post(
            "https://api.openai.com/v1/chat/completions", {
                model: "gpt-4",
                messages: [{
                    role: "user",
                    content: userMessage
                }],
            }, {
                headers: {
                    Authorization: `Bearer ${OPENAI_API_KEY}`
                },
            }
        );

        // Проверяем, есть ли ответ от AI
        const replyText = response.data?.choices?.[0]?.message?.content || "🤖 AI не смог ответить.";
        bot.sendMessage(chatId, replyText);
    } catch (error) {
        console.error("Ошибка AI:", error);
        bot.sendMessage(chatId, "Ошибка при обработке запроса. Попробуйте позже.");
    }
});

console.log("✅ Бот запущен...");