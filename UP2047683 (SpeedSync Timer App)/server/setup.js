const sqlite3 = require('sqlite3').verbose();
const path = require('path');
const fs = require('fs');

const dbPath = path.join(__dirname, 'race_results.db');
if (!fs.existsSync(dbPath)) {
  fs.writeFileSync(dbPath, '');
}

const db = new sqlite3.Database(dbPath, (err) => {
  if (err) console.error(err);
  else console.log('Connected to SQLite database');
  db.exec("PRAGMA journal_mode = WAL;");  //added this so i didnt have to keep interacting with the terminal to add to db. 
});

db.run(`
  CREATE TABLE IF NOT EXISTS results (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    runner_number TEXT,
    finish_time INTEGER,
    recorded_at TEXT,
    UNIQUE(runner_number, finish_time)
  )
`, (err) => {
  if (err) {
    console.error('Error creating table:', err.message);
  } else {
    console.log('Table created or already exists');
  }

  db.close(() => {
    console.log('Database setup complete');
  });
});
