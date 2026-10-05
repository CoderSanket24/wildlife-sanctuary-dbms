import express from 'express'
import cookieParser from 'cookie-parser'
import cors from 'cors'
import dotenv from 'dotenv'
import helmet from 'helmet'
import rateLimit from 'express-rate-limit'
import patchBigInt from './utils/patchBigInt.js'
import authRoutes from './routes/authRoutes.js'
import adminRoutes from './routes/adminRoutes.js'
import ticketRoutes from './routes/ticketRoutes.js'
import zoneRoutes from './routes/zoneRoutes.js'
import habitatRoutes from './routes/habitatRoutes.js'
import faunaRoutes from './routes/faunaRoutes.js'
import healthRoutes from './routes/healthRoutes.js'
import feedbackRoutes from './routes/feedbackRoutes.js'
import contactRoutes from './routes/contactRoutes.js'
import dashboardRoutes from './routes/dashboardRoutes.js'
import prisma from './config/prisma.js'
import ping from 'ping'
import { Server } from 'socket.io'

dotenv.config()
patchBigInt()

const app = express()
const PORT = process.env.PORT || 4000
const FRONTEND_URL = process.env.FRONTEND_URL || 'http://localhost:5173'

// Trust Render's (and any cloud) load balancer — required for rate limiting
// and accurate IP detection behind a reverse proxy
app.set('trust proxy', 1)

// ── Security headers ──────────────────────────────────────────────────────────
app.use(helmet())

// ── CORS ─────────────────────────────────────────────────────────────────────
const allowedOrigins = [
  FRONTEND_URL.replace(/\/$/, ''),
  'https://wildlife-sanctuary-dbms.vercel.app'
]

app.use(cors({
  origin: (origin, callback) => {
    if (!origin) return callback(null, true)
    const cleanOrigin = origin.replace(/\/$/, '')
    if (allowedOrigins.includes(cleanOrigin) || cleanOrigin.endsWith('.vercel.app')) {
      return callback(null, true)
    }
    return callback(null, true) // Fallback for dev / preview deployments
  },
  credentials: true,
}))

// ── Body parsers ──────────────────────────────────────────────────────────────
app.use(express.json())
app.use(cookieParser())

// 🌐 Network Layer: IP Logging Middleware 🌐
app.use((req, res, next) => {
  const rawIp = req.ip || req.socket.remoteAddress || 'unknown';

  // Normalize IP address (Unit II: Logical Addressing - IPv4 & IPv6)
  // ::1            → IPv6 loopback → normalize to 127.0.0.1
  // ::ffff:1.2.3.4 → IPv4-mapped IPv6 → strip prefix to get pure IPv4
  let ip = rawIp;
  if (rawIp === '::1') {
    ip = '127.0.0.1';          // IPv6 loopback → IPv4 loopback
  } else if (rawIp.startsWith('::ffff:')) {
    ip = rawIp.slice(7);       // Strip IPv4-mapped IPv6 prefix
  }

  // Detect IP version
  const ipVersion = ip.includes(':') ? 'IPv6' : 'IPv4';

  console.log(`[Network Layer] ${req.method} ${req.path} | ${ipVersion}: ${ip}`);
  next();
})

// ── Rate limiters ─────────────────────────────────────────────────────────────
// Strict limit on auth endpoints (brute-force protection)
const authLimiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutes
  max: 30,
  standardHeaders: true,
  legacyHeaders: false,
  skip: (req) => req.method === 'OPTIONS', // Never rate-limit preflight OPTIONS requests
  message: { success: false, error: 'Too many requests from this IP. Please try again in 15 minutes.' },
})

// General limit for all other routes
const generalLimiter = rateLimit({
  windowMs: 15 * 60 * 1000,
  max: 300,
  standardHeaders: true,
  legacyHeaders: false,
  skip: (req) => req.method === 'OPTIONS', // Never rate-limit preflight OPTIONS requests
  message: { success: false, error: 'Too many requests. Please slow down.' },
})

app.use('/api/auth/login',    authLimiter)
app.use('/api/auth/register', authLimiter)
app.use(generalLimiter)

// ── Health check (used by Render and docker-compose) ─────────────────────────
app.get('/api/health', (req, res) => {
  res.status(200).json({ status: 'ok', timestamp: new Date().toISOString() })
})

// 🌐 Network Layer: ICMP Ping Health Check 🌐
app.get('/api/network-health', async (req, res) => {
  try {
    // Pinging Google's Public DNS (8.8.8.8) to test outbound WAN connectivity
    // Demonstrates Unit II: ICMP Protocol
    const result = await ping.promise.probe('8.8.8.8');
    res.status(200).json({
      protocol: 'ICMP',
      target: result.host,
      isAlive: result.alive,
      latencyMs: result.time,
      packetLoss: result.packetLoss
    });
  } catch (error) {
    res.status(500).json({ success: false, error: 'ICMP Ping failed' });
  }
})

// ── Routes ────────────────────────────────────────────────────────────────────
app.use('/api/auth',      authRoutes)
app.use('/api/admin',     adminRoutes)
app.use('/api/tickets',   ticketRoutes)
app.use('/api/zones',     zoneRoutes)
app.use('/api/sanctuary', habitatRoutes)
app.use('/api/fauna',     faunaRoutes)
app.use('/api/medical',   healthRoutes)
app.use('/api/feedback',  feedbackRoutes)
app.use('/api/contact',   contactRoutes)
app.use('/api/dashboard', dashboardRoutes)

// ── 404 handler ───────────────────────────────────────────────────────────────
app.use((req, res) => {
  res.status(404).json({ success: false, error: `Route ${req.method} ${req.path} not found.` })
})

// ── Global error handler ──────────────────────────────────────────────────────
app.use((err, req, res, next) => {
  console.error('🔥 Internal System Fault:', err.stack)
  res.status(500).json({ success: false, error: 'Internal Server Error.' })
})

// ── Start server ──────────────────────────────────────────────────────────────
const server = app.listen(PORT, () => {
  console.log(`✅ Server listening on http://localhost:${PORT}`)
})

// 🌐 Transport Layer: TCP/WebSockets using Socket.io 🌐
const io = new Server(server, {
  cors: {
    origin: allowedOrigins,
    credentials: true,
  }
})

io.on('connection', (socket) => {
  console.log(`[Transport Layer] TCP Socket Connected: ${socket.id}`);
  socket.on('disconnect', () => {
    console.log(`[Transport Layer] TCP Socket Disconnected: ${socket.id}`);
  });
});

// Make io accessible in controllers
app.locals.io = io;

// ── Graceful shutdown (SIGTERM from Docker / Render, SIGINT from Ctrl+C) ──────
const shutdown = async (signal) => {
  console.log(`\n${signal} received — shutting down gracefully...`)
  server.close(async () => {
    await prisma.$disconnect()
    console.log('Database connection pool closed.')
    process.exit(0)
  })

  // Force exit if graceful shutdown takes too long
  setTimeout(() => {
    console.error('Forced exit after timeout.')
    process.exit(1)
  }, 10_000)
}

process.on('SIGTERM', () => shutdown('SIGTERM'))
process.on('SIGINT',  () => shutdown('SIGINT'))