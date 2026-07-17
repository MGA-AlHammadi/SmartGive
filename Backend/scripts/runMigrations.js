const fs = require('fs');
const path = require('path');
const db = require('../config/db');
require('dotenv').config();

const migrationsDir = path.join(__dirname, '../../Database/migrations');

const runMigrations = async () => {
    try {
        console.log('🔄 Starting database migrations...\n');

        // Get all SQL files in the migrations directory
        const files = fs.readdirSync(migrationsDir)
            .filter(file => file.endsWith('.sql'))
            .sort();

        if (files.length === 0) {
            console.log('✅ No migration files found.');
            return;
        }

        console.log(`Found ${files.length} migration file(s):\n`);

        for (const file of files) {
            const filePath = path.join(migrationsDir, file);
            const sql = fs.readFileSync(filePath, 'utf8');

            console.log(`📝 Running: ${file}`);
            
            try {
                await db.query(sql);
                console.log(`✅ ${file} - SUCCESS\n`);
            } catch (err) {
                // Check if it's a "already exists" error (which is okay)
                if (err.message.includes('already exists') || 
                    err.message.includes('duplicate key') ||
                    err.message.includes('existiert bereits') ||
                    (err.message.includes('Relation') && err.message.includes('existiert bereits')) ||
                    err.message.includes('column') && err.message.includes('already exists')) {
                    console.log(`⚠️  ${file} - SKIPPED (already applied)\n`);
                } else {
                    console.error(`❌ ${file} - FAILED\n`, err.message);
                    throw err;
                }
            }
        }

        console.log('\n✅ All migrations completed successfully!');
    } catch (err) {
        console.error('\n❌ Migration failed:', err.message);
        process.exit(1);
    }
};

// Run migrations
runMigrations().then(() => {
    process.exit(0);
}).catch(err => {
    console.error('Fatal error:', err);
    process.exit(1);
});
