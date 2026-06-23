import argon2 from 'argon2'
import jwt from 'jsonwebtoken'
import prisma from '../config/prisma.js'

const JWT_SECRET = process.env.JWT_SECRET

export const registerVisitor = async (req, res) => {
    try {
        const { email, password, first_name, last_name, age } = req.body

        const existingUser = await prisma.visitor.findUnique({ where: { email } })
        if (existingUser) {
            return res.status(409).json({ success: false, message: 'Email is already registered.' })
        }

        const hashedPasswor = await argon2.hash(password)

        const newVisitor = await prisma.visitor.create({
            data: {
                email,
                password_hash: hashedPasswor,
                first_name,
                last_name,
                age
            },

            select: {
                visitor_id: true,
                email: true,
                first_name: true,
                last_name: true,
                age: true,
                role: true,
                created_at: true
            }
        })
        return res.status(201).json({ success: true, message: 'Visitor registered successfully.', user: newVisitor })
    } catch (error) {
        return res.status(500).json({ success: false, message: 'Error occurred while registering visitor.' })
    }
}

export const loginVisitor = async (req, res) => {
    try {
        const { email, password } = req.body

        const visitor = await prisma.visitor.findUnique({ where: { email } })

        if (!visitor) {
            return res.status(401).json({ success: false, message: 'Invalid email or password.' })
        }

        const isPasswordValid = await argon2.verify(visitor.password_hash, password)
        if (!isPasswordValid) {
            return res.status(401).json({ success: false, message: 'Invalid email or password.' })
        }

        const token = jwt.sign({visitor_id:visitor.visitor_id, role: visitor.role}, JWT_SECRET, { expiresIn: '1d' })

        res.cookie('session_token', token, {
            httpOnly: true,
            secure: process.env.NODE_ENV === 'production',
            sameSite: 'lax',
            maxAge: 24 * 60 * 60 * 1000 // 1 day
        })

        return res.status(200).json({
            success: true, 
            message: 'Login successful.',
            user: {
                visitor_id: visitor.visitor_id,
                email: visitor.email,
                first_name: visitor.first_name,
                last_name: visitor.last_name,
                role: visitor.role
            }
        })

    } catch (error) {
        console.error('Error during visitor login:', error)
        return res.status(500).json({ success: false, message: 'Error occurred while logging in.' })
    }
}

export const logoutVisitor = async (req, res) => {
  try {
    res.clearCookie('session_token', {
      httpOnly: true,
      secure: process.env.NODE_ENV === 'production',
      sameSite: 'lax',
      expires: new Date(0) 
    });

    return res.status(200).json({
      success: true,
      message: 'Session terminated successfully. Token handles cleared.'
    });
  } catch (error) {
    console.error('🔥 Logout Operational Fault:', error);
    return res.status(500).json({ success: false, error: 'Internal failure during session termination.' });
  }
};

export const getMe = async (req, res) => {
  try {
    const visitor = await prisma.visitor.findUnique({
      where: { visitor_id: req.user.visitor_id },
      select: {
        visitor_id: true,
        email: true,
        first_name: true,
        last_name: true,
        age: true,
        role: true,
        created_at: true,
      },
    });

    if (!visitor) {
      return res.status(404).json({ success: false, message: 'Visitor not found.' });
    }

    return res.status(200).json({ success: true, user: visitor });
  } catch (error) {
    console.error('Error fetching visitor profile:', error);
    return res.status(500).json({ success: false, message: 'Error occurred while fetching profile.' });
  }
};