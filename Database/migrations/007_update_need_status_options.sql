-- Aktualisierung des Status-Constraints für ngo_needs, um 'erledigt' einzuschließen
ALTER TABLE ngo_needs DROP CONSTRAINT IF EXISTS ngo_needs_status_check;
ALTER TABLE ngo_needs ADD CONSTRAINT ngo_needs_status_check CHECK (status IN ('active', 'fulfilled', 'closed', 'erledigt'));

-- Optional: Bestehende 'fulfilled'-Stati zu 'erledigt' migrieren
UPDATE ngo_needs SET status = 'erledigt' WHERE status = 'fulfilled';