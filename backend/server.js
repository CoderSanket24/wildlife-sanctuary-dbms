import express from 'express'
import cookieParser from 'cookie-parser'
import cors from 'cors'
import dotenv from 'dotenv'
import patchBigInt from './utils/patchBigInt.js'
import authRoutes from './routes/authRoutes.js'
import ticketRoutes from './routes/ticketRoutes.js'
import zoneRoutes from './routes/zoneRoutes.js'
import habitatRoutes from './routes/habitatRoutes.js'
import faunaRoutes from './routes/faunaRoutes.js'
import healthRoutes from './routes/healthRoutes.js'
import dashboardRoutes from './routes/dashboardRoutes.js'
import adminRoutes    from './routes/adminRoutes.js'
import feedbackRoutes from './routes/feedbackRoutes.js'
import prisma from './config/prisma.js'

dotenv.config()
patchBigInt()

const app = express()
const PORT = process.env.PORT || 5000

app.use(express.json())
app.use(cookieParser())
app.use(cors({
  origin: process.env.FRONTEND_URL || 'http://localhost:5173',
  credentials: true,
}))

app.use('/api/auth',      authRoutes)
app.use('/api/ticket',    ticketRoutes)
app.use('/api/zones',     zoneRoutes)
app.use('/api/sanctuary', habitatRoutes)
app.use('/api/fauna',     faunaRoutes)
app.use('/api/medical',   healthRoutes)
app.use('/api/dashboard', dashboardRoutes)
app.use('/api/admin',    adminRoutes)
app.use('/api/feedback', feedbackRoutes)

app.use((err, req, res, next) => {
    console.error('🔥 Internal System Fault Hooked:', err.stack)
    res.status(500).json({ success: false, error: 'Internal Server Error encountered in core loops.' })
})

const server = app.listen(PORT, async () => {
    console.log(`server is listening on http://localhost:${PORT}`)

    // Pre-warm the DB connection pool so the very first user
    // request never hits a cold pool → prevents ERR_CONNECTION_RESET
    try {
        await prisma.$queryRaw`SELECT 1`
        console.log('✅ Database connection pool warmed up')
    } catch (err) {
        console.error('❌ DB warm-up failed — check DATABASE_URL:', err.message)
    }
})

// Prevent ERR_CONNECTION_RESET on slow first requests:
// keepAliveTimeout must be > any upstream proxy/load-balancer idle timeout.
// headersTimeout must be > keepAliveTimeout.
server.keepAliveTimeout = 65000   // 65 s
server.headersTimeout   = 70000   // 70 s (must exceed keepAliveTimeout)