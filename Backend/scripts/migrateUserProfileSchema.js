const fs = require('node:fs');
const path = require('node:path');
const db = require('../config/db');

async function main() {
  const sqlPath = path.resolve(__dirname, '../../Database/migrations/003_add_user_profile_and_activity.sql');
  const sql = fs.readFileSync(sqlPath, 'utf8');

  await db.query(sql);
  console.log('Migration 003 applied successfully.');
}

main()
  .then(() => process.exit(0))
  .catch((error) => {
    console.error('Failed to apply migration 003:', error);
    process.exit(1);
  });
