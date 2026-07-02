import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';
import { loginUser, registerUser, fetchMyProfile } from '../authService';

// Fetch API global mocken
global.fetch = vi.fn();

describe('Auth Service', () => {
  beforeEach(() => {
    // localStorage mocken
    Storage.prototype.getItem = vi.fn();
    Storage.prototype.setItem = vi.fn();
  });

  afterEach(() => {
    vi.clearAllMocks();
  });

  describe('loginUser', () => {
    it('sollte sich erfolgreich einloggen und die Daten zurückgeben', async () => {
      const mockResponse = { token: 'fake_jwt', user: { username: 'testuser' } };
      
      // Simuliere erfolgreiche Fetch-Antwort
      fetch.mockResolvedValueOnce({
        ok: true,
        json: async () => mockResponse
      });

      const result = await loginUser('testuser', 'password123');

      expect(fetch).toHaveBeenCalledWith('http://localhost:5000/api/auth/login', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ username: 'testuser', password: 'password123' })
      });
      expect(result).toEqual(mockResponse);
    });

    it('sollte einen Error werfen, wenn das Backend einen Fehler zurückgibt', async () => {
      fetch.mockResolvedValueOnce({
        ok: false,
        json: async () => ({ message: 'Ungültiges Passwort' })
      });

      // Wir erwarten, dass die Funktion einen fehler wirft (rejects)
      await expect(loginUser('testuser', 'wrongpass')).rejects.toThrow('Ungültiges Passwort');
    });
  });

  describe('fetchMyProfile', () => {
      it('sollte das eigene Profil abrufen, wenn ein Token im localStorage liegt', async () => {
          // Token im BrowserStorage platzieren
          vi.mocked(localStorage.getItem).mockReturnValue('valid_token_123');

          const mockProfile = { id: 1, firstName: 'Max' };
          fetch.mockResolvedValueOnce({
              ok: true,
              json: async () => mockProfile
          });

          const result = await fetchMyProfile();

          expect(localStorage.getItem).toHaveBeenCalledWith('token');
          expect(fetch).toHaveBeenCalledWith('http://localhost:5000/api/auth/me', {
              headers: {
                  'Content-Type': 'application/json',
                  'Authorization': 'Bearer valid_token_123'
              },
              cache: 'no-store'
          });
          expect(result).toEqual(mockProfile);
      });

      it('sollte einen Error werfen, wenn kein Token vorhanden ist', async () => {
          // localStorage liefert null
          vi.mocked(localStorage.getItem).mockReturnValue(null);

          await expect(fetchMyProfile()).rejects.toThrow('Bitte melden Sie sich erneut an');
          expect(fetch).not.toHaveBeenCalled(); // fetch sollte gar nicht erst aufgerufen werden
      });
  });
});