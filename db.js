import Database from "better-sqlite3";

// Подключаем базу в текущей папке
const db = new Database("./database.db", {
    verbose: console.log
});

// Создаём таблицу пользователей (если её нет)
db.exec(`
  CREATE TABLE IF NOT EXISTS users (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    telegram_id INTEGER UNIQUE,
    name TEXT,
    phone TEXT,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
  )
`);

console.log("✅ База данных SQLite подключена!");

export default db;