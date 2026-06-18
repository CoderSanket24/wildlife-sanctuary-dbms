import prisma from "../config/prisma.js";

export const addNewZone = async (req, res) => {
    try {
        const { name, climate, camera_traps_count, ticket_price } = req.body;

        if (!name || !ticket_price) {
            return res.status(400).json({ success: false, error: 'Input Mismatch: Zone name and baseline pricing are required.' });
        }

        const newZone = await prisma.zone.create({
            data: {
                name,
                climate: climate || 'TROPICAL',
                camera_traps_count: parseInt(camera_traps_count, 10) || 0,
                ticket_price: parseFloat(ticket_price)
            }
        });

        return res.status(201).json({
            success: true,
            message: 'New structural sanctuary sector provisioned successfully.',
            zone: newZone
        });
    } catch (error) {
        console.error('🔥 Administrative Zone Creation Blocked:', error);

        if (error.code === 'P2002') {
            return res.status(409).json({ success: false, error: 'Database Collision: A sanctuary sector with this name already exists.' });
        }

        return res.status(500).json({ success: false, error: 'Internal system fault deploying sector maps.' });
    }
}