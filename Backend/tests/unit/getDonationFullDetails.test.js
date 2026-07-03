const donationService = require('../../services/donationService');
const db = require('../../config/db');

jest.mock('../../config/db');

describe('donationService - getDonationFullDetails', () => {
    afterEach(() => {
        jest.clearAllMocks();
    });

    it('sollte die vollständigen Spende-Daten inkl. NGO- und Spendernamen zurückgeben', async () => {
        const mockRow = {
            id: 11,
            donor_user_id: 14,
            ngo_user_id: 15,
            ngo_need_id: 11,
            item_name: 'Hose',
            category: 'Unterteil',
            quantity: 10,
            condition: 'good',
            country: 'Deutschland',
            city: 'Berlin',
            status: 'delivered',
            need_title: 'Hose',
            ngo_name: 'Ls berlin',
            donor_first_name: 'Max',
            donor_last_name: 'Mustermann',
            created_at: '2026-07-02T10:24:02.633Z',
            delivered_at: '2026-07-02T10:24:17.146Z'
        };

        db.query.mockResolvedValue({ rows: [mockRow] });

        const result = await donationService.getDonationFullDetails(11);

        expect(db.query).toHaveBeenCalledTimes(1);
        expect(db.query).toHaveBeenCalledWith(
            expect.stringContaining('SELECT'),
            [11]
        );
        expect(result).toEqual(mockRow);
        expect(result.ngo_name).toBe('Ls berlin');
        expect(result.donor_first_name).toBe('Max');
    });

    it('sollte undefined/null zurückgeben, wenn die Spende nicht existiert', async () => {
        db.query.mockResolvedValue({ rows: [] });

        const result = await donationService.getDonationFullDetails(9999);

        expect(result).toBeUndefined();
    });

    it('sollte einen Datenbankfehler weiterwerfen', async () => {
        db.query.mockRejectedValue(new Error('DB connection failed'));

        await expect(donationService.getDonationFullDetails(11)).rejects.toThrow('DB connection failed');
    });
});
