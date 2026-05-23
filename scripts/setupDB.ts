import Database from 'better-sqlite3';
import * as path from 'path';

const dbPath = path.join(__dirname, '../sentinel.db');
const db = new Database(dbPath);

db.exec(`
  CREATE TABLE IF NOT EXISTS Incidents (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    timestamp TEXT,
    service_name TEXT,
    error_message TEXT,
    status TEXT
  );

  CREATE TABLE IF NOT EXISTS SystemHealth (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    last_poll TEXT,
    status TEXT
  );
  
  DELETE FROM SystemHealth;
  INSERT INTO SystemHealth (last_poll, status) VALUES (datetime('now'), 'Healthy');
`);

console.log('Database initialized at', dbPath);
