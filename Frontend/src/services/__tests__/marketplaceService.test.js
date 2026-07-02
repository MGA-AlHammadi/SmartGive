import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';
import { fetchNeeds, createNeed } from '../marketplaceService';

// Hole die Service-Methoden und mocke global fetch
global.fetch = vi.fn();

describe('Marketplace Service', () => {
    beforeEach(() => {
        // localStorage mocken
        Storage.prototype.getItem = vi.fn().mockReturnValue('fake_jwt_token');
    });

    afterEach(() => {
        vi.clearAllMocks();
    });

    describe('fetchNeeds', () => {
        it('sollte Bedarfe (Needs) ohne Filter-Parameter richtig von der API abrufen', async () => {
            const mockNeeds = [{ id: 1, title: 'Jacken' }, { id: 2, title: 'Hosen' }];
            fetch.mockResolvedValueOnce({
                ok: true,
                json: async () => mockNeeds
            });

            const result = await fetchNeeds();

            // Prüfen, ob die exakte URL (ohne query) aufgerufen wird
            expect(fetch).toHaveBeenCalledWith('http://localhost:5000/api/needs');
            expect(result).toEqual(mockNeeds);
        });

        it('sollte Bedarfe mit Filtern (Query-Parametern) richtig abrufen', async () => {
             fetch.mockResolvedValueOnce({
                 ok: true,
                 json: async () => []
             });

             await fetchNeeds({ category: 'Kleidung', city: 'Berlin' });

             expect(fetch).toHaveBeenCalledWith('http://localhost:5000/api/needs?category=Kleidung&city=Berlin');
        });

        it('sollte einen Fehler werfen, wenn das Backend einen Fehler meldet', async () => {
             fetch.mockResolvedValueOnce({
                 ok: false,
                 json: async () => ({ message: 'Server Fehler' })
             });

             await expect(fetchNeeds()).rejects.toThrow('Server Fehler');
        });
    });

    describe('createNeed', () => {
        it('sollte FormData nutzen und einen Authorization-Header anhängen', async () => {
            fetch.mockResolvedValueOnce({
                ok: true,
                json: async () => ({ message: 'Need created' })
            });

            const payload = { title: 'Test', quantityNeeded: 10 };
            
            // simuliere das Absenden ohne Bilddateien
            await createNeed(payload, []);

            expect(localStorage.getItem).toHaveBeenCalledWith('token');
            expect(fetch).toHaveBeenCalledWith('http://localhost:5000/api/needs', {
                 method: 'POST',
                 headers: {
                     Authorization: 'Bearer fake_jwt_token' // Da unser formData genutzt wird, darf 'Content-Type' nicht gesetzt sein
                 },
                 body: expect.any(FormData) 
            });
        });
    });
});
