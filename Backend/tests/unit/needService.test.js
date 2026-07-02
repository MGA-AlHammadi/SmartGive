const needService = require('../../services/needService');
const db = require('../../config/db');

// Mocke die gesamte db-Datenbank-Verbindung
jest.mock('../../config/db');

describe('Need Service Unit Tests', () => {
    afterEach(() => {
        jest.clearAllMocks(); // Resette Mocks nach jedem Test
    });

    describe('createNeed', () => {
        it('sollte erfolgreich einen neuen Need erstellen und zurückgeben', async () => {
            const mockData = {
                ngoUserId: 1,
                title: 'Winterjacken benötigt',
                category: 'Kleidung',
                gender: 'unisex',
                size: 'M',
                quantityNeeded: 50,
                country: 'Deutschland',
                city: 'Berlin',
                description: 'Wir benötigen warme Jacken für den Winter.',
                neededBy: '2026-10-01',
                imageUrls: []
            };

            const mockDbRow = {
                id: 101,
                ...mockData,
                status: 'active',
                created_at: '2026-06-30'
            };

            // Simuliere die Antwort der Datenbank (db.query)
            db.query.mockResolvedValue({ rows: [mockDbRow] });

            const result = await needService.createNeed(mockData);

            // 1. Prüfen, ob db.query genau 1 mal aufgerufen wurde
            expect(db.query).toHaveBeenCalledTimes(1);

            // 2. Prüfen, ob db.query mit dem richtigen SQL-String (INSERT) aufgerufen wurde
            expect(db.query).toHaveBeenCalledWith(
                expect.stringContaining('INSERT INTO ngo_needs'),
                expect.any(Array) // Parameter-Array
            );

            // 3. Prüfen, ob das Ergebnis dem Row-Objekt entspricht
            expect(result).toEqual(mockDbRow);
        });
    });

    describe('listNeeds', () => {
        it('sollte Needs filtern und alle aktiven zurückgeben, wenn keine Filter übergeben werden', async () => {
            const mockNeeds = [
                { id: 1, title: 'Bedarf 1', status: 'active' },
                { id: 2, title: 'Bedarf 2', status: 'active' }
            ];

            db.query.mockResolvedValue({ rows: mockNeeds });

            // Kein Filter übergeben
            const result = await needService.listNeeds({});

            expect(db.query).toHaveBeenCalledTimes(1);
            expect(db.query).toHaveBeenCalledWith(
                expect.stringContaining('WHERE status = $1'), // status = 'active' sollte der Default-Filter sein
                ['active']
            );
            expect(result).toEqual(mockNeeds);
        });

        it('sollte Needs korrekt nach Kategorien filtern', async () => {
            db.query.mockResolvedValue({ rows: [] });

            // Übergebe 'Kleidung' als Kategorie
            await needService.listNeeds({ category: 'Kleidung' });

            expect(db.query).toHaveBeenCalledTimes(1);
            expect(db.query).toHaveBeenCalledWith(
                expect.stringContaining('WHERE category = $1 AND status = $2'), 
                ['Kleidung', 'active']
            );
        });
    });

    describe('getNeedById', () => {
         it('sollte einen spezifischen Need finden', async () => {
             const mockNeed = { id: 5, title: 'Test Need' };
             db.query.mockResolvedValue({ rows: [mockNeed] });
             
             const result = await needService.getNeedById(5);
             
             expect(db.query).toHaveBeenCalledWith('SELECT * FROM ngo_needs WHERE id = $1', [5]);
             expect(result).toEqual(mockNeed);
         });
    });
});
