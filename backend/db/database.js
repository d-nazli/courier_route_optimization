const sqlite3 = require('sqlite3').verbose();
const path = require('path');

const db = new sqlite3.Database(path.join(__dirname, 'courier.db'), (err) => {
  if (err) console.error('Veritabanı açılırken hata:', err);
  else console.log('Veritabanı bağlantısı başarılı.');
});

db.serialize(() => {
  db.run(`
    CREATE TABLE IF NOT EXISTS orders (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      username TEXT,
      address TEXT,
      lat REAL,
      lng REAL,
      status TEXT DEFAULT 'pending'
    )
  `);
});

module.exports = db;
