const { z } = require('zod');

const registerSchema = z.object({
    username: z.string().min(3, 'Benutzername muss mindestens 3 Zeichen lang sein'),
    email: z.string().email('Ungültige E-Mail-Adresse'),
    password: z.string().min(6, 'Passwort muss mindestens 6 Zeichen lang sein'),
    firstName: z.string().min(1, 'Vorname ist erforderlich').optional(),
    lastName: z.string().min(1, 'Nachname ist erforderlich').optional(),
    companyName: z.string().optional(),
    address: z.string().optional(),
    companyCountry: z.string().optional(),
    companyCity: z.string().optional(),
    isCompany: z.boolean().default(false)
}).refine((data) => {
    if (data.isCompany) {
        return !!data.companyCountry?.trim() && !!data.companyCity?.trim();
    }
    return true;
}, {
    message: "Land und Stadt sind für NGOs erforderlich",
    path: ["companyCountry"] // zeigt den Fehler bei Land an
});

const loginSchema = z.object({
    email: z.string().email('Ungültige E-Mail-Adresse'),
    password: z.string().min(1, 'Passwort ist erforderlich')
});

module.exports = { registerSchema, loginSchema };
