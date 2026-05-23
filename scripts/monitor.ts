import { exec } from 'child_process';
import Database from 'better-sqlite3';
import * as path from 'path';
import * as fs from 'fs';

let servicesDir = path.join(process.cwd(), 'services');
let dbPath = path.join(process.cwd(), 'sentinel.db');

if (!fs.existsSync(servicesDir)) {
  servicesDir = path.join(process.cwd(), '../services');
  dbPath = path.join(process.cwd(), '../sentinel.db');
}

const db = new Database(dbPath);
const errorLogPath = path.join(servicesDir, 'error.log');

console.log('Starting Sentinel Monitor...');

// Simulate polling by running the service index
exec('npx ts-node index.ts', { cwd: servicesDir }, (error, stdout, stderr) => {
  // Check if stderr contains node experimental warnings and filter them out
  let actualStderr = stderr || '';
  if (actualStderr.includes('ExperimentalWarning')) {
     actualStderr = actualStderr.split('\n').filter(line => !line.includes('ExperimentalWarning') && line.trim() !== '').join('\n');
  }

  if (error || actualStderr) {
    const errorMsg = actualStderr || error?.message || 'Unknown error';
    console.error('Anomaly detected in services!');
    
    // Write raw log to error.log
    fs.writeFileSync(errorLogPath, errorMsg);
    
    // Insert into MCP
    const insert = db.prepare(`
      INSERT INTO Incidents (timestamp, service_name, error_message, status)
      VALUES (datetime('now'), ?, ?, ?)
    `);
    
    insert.run('index.ts', errorMsg, 'Open');
    console.log('Incident logged to MCP and error.log written.');
    
    // Update system health
    db.prepare(`UPDATE SystemHealth SET last_poll = datetime('now'), status = 'Degraded'`).run();
  } else {
    console.log('Service running smoothly.');
    db.prepare(`UPDATE SystemHealth SET last_poll = datetime('now'), status = 'Healthy'`).run();
  }
});
