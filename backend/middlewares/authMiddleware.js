import jwt from 'jsonwebtoken'

const JWT_SECRET = process.env.JWT_SECRET

export const protect = (req, res, next) => {
    try {
        const token = req.cookies.session_token

        if (!token) {
            return res.status(401).json({ success: false, error: 'Access Denied: Session token missing. Please log in to gain access.' })
        }

        const decoded = jwt.verify(token, JWT_SECRET)
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