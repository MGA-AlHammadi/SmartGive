const { z } = require('zod');

const createDonationSchema = z.object({
    itemName: z.string().min(2, 'Name des Gegenstands muss mindestens 2 Zeichen lang sein'),
    category: z.string({ required_error: 'Kategorie ist erforderlich' }),
    quantity: z.preprocess(
        (val) => (typeof val === 'string' ? parseInt(val, 10) : val),
        z.number().positive('Anzahl muss eine positive Zahl sein')
    ),
    gender: z.string().optional(),
    size: z.string().optional(),
    condition: z.string().optional(),
    country: z.string().min(2, 'Land ist erforderlich'),
    city: z.string().min(2, 'Stadt ist erforderlich'),
    notes: z.string().optional(),
    ngoNeedId: z.preprocess(
        (val) => (val === '' || val === 'null' ? null : val),
        z.union([z.number(), z.string(), z.null()]).optional()
    ),
    ngoUserId: z.preprocess(
        (val) => (val === '' || val === 'null' ? null : val),
        z.union([z.number(), z.string(), z.null()]).optional()
    )
});

module.exports = { createDonationSchema };
