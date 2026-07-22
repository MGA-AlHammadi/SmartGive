const fs = require('fs');
const path = require('path');
const db = require('../config/db');
require('dotenv').config();

const migrationsDir = path.join(__dirname, '../../Database/migrations');

const runMigrations = async () => {
    try {
        console.log('🔄 Datenbank-Migrationen werden gestartet...\n');

        // Alle SQL-Dateien im Migrationsverzeichnis abrufen
        const files = fs.readdirSync(migrationsDir)
            .filter(file => file.endsWith('.sql'))
            .sort();

        if (files.length === 0) {
            console.log('✅ Keine Migrationsdateien gefunden.');
            return;
        }

        console.log(`${files.length} Migrationsdatei(en) gefunden:\n`);

        for (const file of files) {
            const filePath = path.join(migrationsDir, file);
            const sql = fs.readFileSync(filePath, 'utf8');

            console.log(`📝 Ausführung: ${file}`);
            
            try {
                await db.query(sql);
                console.log(`✅ ${file} - ERFOLGREICH\n`);
            } catch (err) {
                // Überprüfen, ob es sich um einen "existiert bereits"-Fehler handelt (was in Ordnung ist)
                if (err.message.includes('already exists') || 
                    err.message.includes('duplicate key') ||
                    err.message.includes('existiert bereits') ||
                    (err.message.includes('Relation') && err.message.includes('existiert bereits')) ||
                    err.message.includes('column') && err.message.includes('already exists')) {
                    console.log(`⚠️  ${file} - ÜBERSPRUNGEN (bereits angewendet)\n`);
                } else {
                    console.error(`❌ ${file} - FEHLGESCHLAGEN\n`, err.message);
                    throw err;
                }
            }
        }

        console.log('\n✅ Alle Migrationen erfolgreich abgeschlossen!');
    } catch (err) {
        console.error('\n❌ Migration fehlgeschlagen:', err.message);
        process.exit(1);
    }
};

// Migrationen ausführen
runMigrations().then(() => {
    process.exit(0);
}).catch(err => {
    console.error('Fatal error:', err);
    process.exit(1);
});
