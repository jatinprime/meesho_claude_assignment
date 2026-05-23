const Database = require('better-sqlite3');
const path = require('path');

const dbPath = path.join(__dirname, '../sentinel.db');
const db = new Database(dbPath);

console.log('Connecting to database at:', dbPath);

const result = db.prepare(`
  UPDATE Incidents
  SET status = 'Resolved'
  WHERE status = 'Open' OR status = 'RESOLVED'
`).run();

console.log(`Updated ${result.changes} incidents to 'Resolved'.`);
db.close();
