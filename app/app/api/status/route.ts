import { NextResponse } from 'next/server';
import Database from 'better-sqlite3';
import * as path from 'path';

export const dynamic = 'force-dynamic';

export async function GET() {
  try {
    const dbPath = path.join(process.cwd(), '../sentinel.db');
    const db = new Database(dbPath, { readonly: true });
    
    const incidents = db.prepare('SELECT * FROM Incidents ORDER BY id DESC LIMIT 50').all();
    const systemHealthRow = db.prepare('SELECT * FROM SystemHealth ORDER BY id DESC LIMIT 1').get() as any;
    
    let resolvedCount = 0;
    try {
      const result = db.prepare("SELECT count(*) as count FROM Incidents WHERE status = 'Resolved'").get() as any;
      resolvedCount = result ? result.count : 0;
    } catch(e) {}
    
    let activeCount = 0;
    try {
      const result = db.prepare("SELECT count(*) as count FROM Incidents WHERE status != 'Resolved'").get() as any;
      activeCount = result ? result.count : 0;
    } catch(e) {}

    const health = systemHealthRow?.status || 'Unknown';

    return NextResponse.json({
      incidents,
      health,
      activeCount,
      resolvedCount
    });
  } catch (error) {
    console.error('API Error reading MCP:', error);
    return NextResponse.json({ error: 'Failed to read from MCP' }, { status: 500 });
  }
}
