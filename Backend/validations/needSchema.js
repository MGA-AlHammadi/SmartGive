const { z } = require('zod');

const createNeedSchema = z.object({
    title: z.string().min(3, 'Titel muss mindestens 3 Zeichen lang sein'),
    category: z.string().min(1, 'Kategorie ist erforderlich'),
    quantityNeeded: z.preprocess(
        (val) => (typeof val === 'string' ? parseInt(val, 10) : val),
        z.number().positive('Menge muss eine positive Zahl sein')
    ),
    country: z.string().min(2, 'Land ist erforderlich'),
    city: z.string().min(2, 'Stadt ist erforderlich'),
    gender: z.string().optional(),
    size: z.string().optional(),
    description: z.string().optional(),
    neededBy: z.string().optional()
});

module.exports = { createNeedSchema };
