const validate = (schema) => (req, res, next) => {
    try {
        // req.body validieren
        schema.parse(req.body);
        next();
    } catch (err) {
        // Zod Fehler abfangen (hat .errors oder .issues Array)
        const schemaErrors = err.errors || err.issues;
        
        if (schemaErrors && Array.isArray(schemaErrors)) {
            const errors = schemaErrors.map(e => ({
                field: e.path[0],
                message: e.message
            }));
            return res.status(400).json({ 
                message: 'Validierungsfehler', 
                errors 
            });
        }
        
        console.error('Unerwarteter Validierungsfehler:', err);
        return res.status(500).json({ message: 'Interner Serverfehler bei der Validierung' });
    }
};

module.exports = validate;
