-- Update the status check constraint for ngo_needs to include 'erledigt'
ALTER TABLE ngo_needs DROP CONSTRAINT IF EXISTS ngo_needs_status_check;
ALTER TABLE ngo_needs ADD CONSTRAINT ngo_needs_status_check CHECK (status IN ('active', 'fulfilled', 'closed', 'erledigt'));

-- Optionally migrate existing 'fulfilled' to 'erledigt'
UPDATE ngo_needs SET status = 'erledigt' WHERE status = 'fulfilled';