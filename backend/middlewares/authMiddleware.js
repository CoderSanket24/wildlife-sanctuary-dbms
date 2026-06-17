import jwt from 'jsonwebtoken'

const JWT_SECRET = process.env.JWT_SECRET

export const authenticateVisitor = (req, res, next) => {
    try {
        const token = req.cookies.session_token

        if (!token) {
            res.status(401).json({ success: false, error: 'Access Denied: Session token missing. Please log in to gain access.' })
        }

        const decoded = jwt.verify(token, JWT_SECRET)
        req.visitor = decoded
        next()
    } catch (error) {
        console.error('🔥 Token Verification Corrupted:', error.message);

        if (error.name === 'TokenExpiredError') {
            return res.status(401).json({ success: false, error: 'Session Expired: Please re-authenticate your credentials.' });
        }

        return res.status(401).json({ success: false, error: 'Access Denied: Compromised session signature token.' });
    }
}