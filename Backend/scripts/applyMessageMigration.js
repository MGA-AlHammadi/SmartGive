const fs = require('node:fs');
const path = require('node:path');
require('dotenv').config();
const db = require('../config/db');

async function main() {
  const sqlPath = path.resolve(__dirname, '../../Database/migrations/006_create_messages_table.sql');
  
  if (!fs.existsSync(sqlPath)) {
    console.error(`Migration file not found: ${sqlPath}`);
    process.exit(1);
  }

  const sql = fs.readFileSync(sqlPath, 'utf8');

  try {
    console.log('Applying migration 006 (messages table)...');
    await db.query(sql);
    console.log('Migration 006 applied successfully.');
  } catch (error) {
    console.error('Failed to apply migration 006:', error);
    process.exit(1);
  }
}

main()
  .then(() => process.exit(0))
  .catch((error) => {
    console.error('Unexpected error:', error);
    process.exit(1);
  });