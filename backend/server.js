import express from 'express'
import cookieParser from 'cookie-parser'
import cors from 'cors'
import prisma from './config/prisma.js'
import dotenv from 'dotenv'
import patchBigInt from './utils/patchBigInt.js'

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

app.get('/health', async (req, res) => {
    try {
        await prisma.$queryRaw`SELECT 1`;
        res.status(200).json({ success: true, message: 'Database connection successful' })
    } catch (error) {
        res.status(500).json({ success: false, message: 'Database connection failed' })
    }
})

app.use((err, req, res, next) => {
    console.error('🔥 Internal System Fault Hooked:',err.stack);
    res.status(500).json({success: false, error: 'Internal Server Error encountered in core loops.' });
});

app.listen(PORT, () => {
    console.log(`server is listening on http://localhost:${PORT}`);
})