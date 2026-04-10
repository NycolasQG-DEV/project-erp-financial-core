const sqlite3 = require('sqlite3').verbose();
const path    = require('path');

const dbPath = path.resolve(__dirname, 'database.db');

const db = new sqlite3.Database(dbPath, (err) => {
  if (err) console.error('❌  Erro ao conectar no banco:', err.message);
  else     console.log('✅  Banco SQLite conectado →', dbPath);
});

// Habilita chaves estrangeiras no SQLite
db.run('PRAGMA foreign_keys = ON');

module.exports = db;
