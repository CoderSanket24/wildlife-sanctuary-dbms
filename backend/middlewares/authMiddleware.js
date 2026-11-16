import jwt from 'jsonwebtoken'

const JWT_SECRET = process.env.JWT_SECRET

export const protect = (req, res, next) => {
    try {
        let token = req.cookies?.session_token

        // Support Bearer token header for API clients, scripts, and mobile
        if (!token && req.headers.authorization && req.headers.authorization.startsWith('Bearer ')) {
            token = req.headers.authorization.split(' ')[1]
        }

        if (!token) {
            return res.status(401).json({ success: false, error: 'Access Denied: Session token missing. Please log in to gain access.' })
        }

        // clockTolerance: 300 prevents false expirations from NTP clock drift between client and cloud hosts
        const decoded = jwt.verify(token, JWT_SECRET, { clockTolerance: 300 })
        req.user = decoded
        next()
    } catch (error) {
        console.error('🔥 Token Verification Corrupted:', error.message);

        if (error.name === 'TokenExpiredError') {
            return res.status(401).json({ success: false, error: 'Session Expired: Please re-authenticate your credentials.' });
        }

        return res.status(401).json({ success: false, error: 'Access Denied: Compromised session signature token.' });
    }
}

export const restrictTo = (...allowedRoles) => {
    return (req, res, next) => {
        if (!req.user || !req.user.role) {
            return res.status(403).json({
                success: false,
                error: 'Access Denied: Security framework could not verify user role attributes.'
            });
        }
        if (!allowedRoles.includes(req.user.role)) {
            return res.status(403).json({
                success: false,
                error: 'Access Denied: You do not possess the administrative clearance to perform this action.'
            });
        }
        return next();
    }
}