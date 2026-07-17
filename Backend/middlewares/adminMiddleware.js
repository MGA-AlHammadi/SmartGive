const adminMiddleware = (req, res, next) => {
    if (!req.user) {
        return res.status(401).json({ message: 'Authentifizierung erforderlich' });
    }

    if (req.user.role !== 'admin') {
        return res.status(403).json({ message: 'Nur Administratoren haben Zugriff auf diese Ressource' });
    }

    next();
};

module.exports = adminMiddleware;
