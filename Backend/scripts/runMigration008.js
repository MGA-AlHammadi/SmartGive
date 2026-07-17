const fs = require('fs');
const path = require('path');
const db = require('../config/db');
require('dotenv').config();

const runMigration = async () => {
    try {
        console.log('\n🔄 Running 008_add_admin_role.sql migration manually...\n');

        const filePath = path.join(__dirname, '../../Database/migrations/008_add_admin_role.sql');
        const sql = fs.readFileSync(filePath, 'utf8');

        // Split by semicolon and execute each statement
        const statements = sql.split(';').filter(s => s.trim());

        for (const statement of statements) {
            try {
                console.log(`📝 Executing: ${statement.substring(0, 50)}...`);
                await db.query(statement.trim());
                console.log(`✅ Success\n`);
            } catch (err) {
                if (err.message.includes('already exists') || err.message.includes('existiert bereits')) {
                    console.log(`⚠️  Already exists (skipped)\n`);
                } else {
                    throw err;
                }
            }
        }

        console.log('✅ Migration completed!\n');
        process.exit(0);
    } catch (err) {
        console.error('❌ Error:', err.message);
        process.exit(1);
    }
};

runMigration();
