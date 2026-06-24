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
import healthRoutes from './routes/healthRoutes.js';

dotenv.config()
patchBigInt()

const app = express()
const PORT = process.env.PORT || 4000

app.use(express.json())
app.use(cookieParser())
app.use(cors({
  origin: process.env.FRONTEND_URL || 'http://localhost:5173',
  credentials: true, // Crucial parameter to allow HTTP-only session cookies to pass through the network
}));
app.use('/api/auth', authRoutes)
app.use('/api/ticket', ticketRoutes)
app.use('/api/zones', zoneRoutes)
app.use('/api/sanctuary', habitatRoutes)
app.use('/api/fauna', faunaRoutes)
app.use('/api/medical', healthRoutes)

app.use((err, req, res, next) => {
    console.error('🔥 Internal System Fault Hooked:',err.stack);
    res.status(500).json({success: false, error: 'Internal Server Error encountered in core loops.' });
});

app.listen(PORT, () => {
    console.log(`server is listening on http://localhost:${PORT}`);
})