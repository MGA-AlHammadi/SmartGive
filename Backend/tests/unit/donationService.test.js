const donationService = require('../../services/donationService');
const db = require('../../config/db');

jest.mock('../../config/db');

describe('Donation Service Unit Tests', () => {
    afterEach(() => {
        jest.clearAllMocks();
    });

    describe('createDonation', () => {
        it('sollte eine Spende erfolgreich speichern', async () => {
            const mockData = {
                donorUserId: 10,
                ngoNeedId: 5,
                ngoUserId: 1,
                itemName: 'Winterjacke',
                category: 'Kleidung',
                gender: 'Männlich',
                size: 'L',
                quantity: 1,
                condition: 'Gut',
                country: 'Deutschland',
                city: 'Berlin',
                notes: 'Sehr warm',
                imageUrls: []
            };

            const mockDbRow = {
                id: 50,
                ...mockData,
                status: 'pending',
                created_at: '2026-06-30'
            };

            db.query.mockResolvedValue({ rows: [mockDbRow] });

            const result = await donationService.createDonation(mockData);

            expect(db.query).toHaveBeenCalledTimes(1);
            expect(db.query).toHaveBeenCalledWith(
                expect.stringContaining('INSERT INTO donations'),
                expect.any(Array)
            );
            expect(result).toEqual(mockDbRow);
        });
    });

    describe('updateDonationStatus', () => {
        it('sollte den Status der Spende aktualisieren, ohne den Need zu verändern, wenn Status auf "accepted" gesetzt wird', async () => {
            // Mock für das Lesen der aktuellen Spende
            db.query.mockResolvedValueOnce({ rows: [{ status: 'pending', ngo_need_id: 5, quantity: 10 }] });

            // Mock für das Claimen (wird hier übersprungen, da wir keinen actingNgoUserId übergeben oder ngo_user_id schon da ist - hier mocken wir den Update der Donation)
            db.query.mockResolvedValueOnce({ rows: [{ id: 50, status: 'accepted' }] }); 

            const result = await donationService.updateDonationStatus(50, 'accepted');

            // 1. db.query (SELECT)
            // 2. db.query (UPDATE donations)
            expect(db.query).toHaveBeenCalledTimes(2); 
            expect(db.query).toHaveBeenNthCalledWith(
                2, 
                expect.stringContaining('UPDATE donations'), 
                ['accepted', 50]
            );
            expect(result).toEqual({ id: 50, status: 'accepted' });
        });

        it('sollte die erhaltene Menge (quantity_received) im Need erhöhen, wenn der Status auf "delivered" wechselt', async () => {
             // 1. Aktuelle Spende auslesen
             db.query.mockResolvedValueOnce({ rows: [{ status: 'accepted', ngo_need_id: 5, quantity: 10 }] });

             // 2. Update der Spende
             db.query.mockResolvedValueOnce({ rows: [{ id: 50, status: 'delivered', quantity: 10 }] });

             // 3. Update des Needs (quantity_received erhöhen)
             db.query.mockResolvedValueOnce({ rows: [] });

             const result = await donationService.updateDonationStatus(50, 'delivered');

             expect(db.query).toHaveBeenCalledTimes(3);

             // Prüfen auf das 3. Query (Update ngo_needs)
             expect(db.query).toHaveBeenNthCalledWith(
                 3,
                 expect.stringContaining('UPDATE ngo_needs'),
                 [10, 5] // 10 ist die Menge, 5 ist die ngo_need_id
             );
             expect(result).toEqual({ id: 50, status: 'delivered', quantity: 10 });
        });
    });
});