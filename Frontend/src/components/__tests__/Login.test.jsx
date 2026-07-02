import { describe, it, expect, vi, beforeEach } from 'vitest';
import { render, screen, fireEvent } from '@testing-library/react';
import { MemoryRouter } from 'react-router-dom'; // Wichtig für <Link> und useNavigate
import Login from '../../pages/Login';
import * as authService from '../../services/authService';
import toast from 'react-hot-toast';

// Wir mocken den Login-Service und die Notifications (toast)
vi.mock('../../services/authService', () => ({
    loginUser: vi.fn(),
}));

vi.mock('react-hot-toast', () => ({
    default: {
        success: vi.fn(),
        error: vi.fn(),
    }
}));

describe('Login Component', () => {

    beforeEach(() => {
        vi.clearAllMocks();
    });

    it('sollte das Formular (E-Mail, Passwort, Button) richtig auf den Bildschirm rendern', () => {
         render(
             <MemoryRouter>
                 <Login />
             </MemoryRouter>
         );
         
         expect(screen.getByPlaceholderText('name@beispiel.de')).toBeInTheDocument();
         // Weil der Type="password" ist
         expect(screen.getByText('Passwort')).toBeInTheDocument();
         // Weil es unser Button ist
         expect(screen.getByRole('button', { name: /anmelden/i })).toBeInTheDocument();
    });

    it('sollte bei fehlerhaftem Login eine Fehlermeldung auf dem Bildschirm anzeigen', async () => {
         authService.loginUser.mockRejectedValue(new Error('Ungültiger Benutzername oder Passwort'));

         render(
             <MemoryRouter>
                 <Login />
             </MemoryRouter>
         );

         const emailInput = screen.getByPlaceholderText('name@beispiel.de');
         // Hole das Passwort-Feld über das Label
         const passLabel = screen.getByText('Passwort').parentElement.querySelector('input');
         const submitButton = screen.getByRole('button', { name: /anmelden/i });

         // Nutzer füllt Formular aus
         fireEvent.change(emailInput, { target: { value: 'test@invalid.com' } });
         fireEvent.change(passLabel, { target: { value: 'wrong123' } });
         
         // Formular absenden
         fireEvent.click(submitButton);

         // Wir erwarten, dass die Fehlermeldung auftaucht
         const errorMessage = await screen.findByText('Ungültiger Benutzername oder Passwort');
         expect(errorMessage).toBeInTheDocument();
         expect(authService.loginUser).toHaveBeenCalledWith('test@invalid.com', 'wrong123');
    });

    it('sollte bei erfolgreichem Login localStorage setzen und zur Homepage redirecten', async () => {
        authService.loginUser.mockResolvedValue({
             token: 'super_secret',
             user: { id: 1, username: 'test_ngo' }
        });

        // Mock localStorage
        Storage.prototype.setItem = vi.fn();

        render(
            <MemoryRouter>
                <Login />
            </MemoryRouter>
        );

        const emailInput = screen.getByPlaceholderText('name@beispiel.de');
        const passLabel = screen.getByText('Passwort').parentElement.querySelector('input');
        const submitButton = screen.getByRole('button', { name: /anmelden/i });

        fireEvent.change(emailInput, { target: { value: 'ngo@valid.com' } });
        fireEvent.change(passLabel, { target: { value: 'correct456' } });
        fireEvent.click(submitButton);

        // Wir erwarten, dass getItem/setItem genutzt wurde
        await vi.waitFor(() => {
            expect(localStorage.setItem).toHaveBeenCalledWith('token', 'super_secret');
            expect(toast.success).toHaveBeenCalledWith('Willkommen zurück!');
        });
    });
});