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

/* ── GET all zones (public) ── */
export const getAllZones = async (req, res) => {
    try {
        const zones = await prisma.zone.findMany({
            include: {
                _count: {
                    select: {
                        enclosures: true,
                        tickets: true,
                    }
                },
                enclosures: {
                    select: {
                        current_occupancy: true,
                    }
                }
            },
            orderBy: { zone_id: 'asc' }
        });

        // Compute total animal count per zone from enclosure occupancies
        const zonesWithStats = zones.map(zone => ({
            ...zone,
            enclosure_count: zone._count.enclosures,
            ticket_count: zone._count.tickets,
            total_animals: zone.enclosures.reduce((sum, e) => sum + e.current_occupancy, 0),
            enclosures: undefined,
            _count: undefined,
        }));

        return res.status(200).json({ success: true, zones: zonesWithStats });
    } catch (error) {
        console.error('🔥 Zone Fetch Error:', error);
        return res.status(500).json({ success: false, error: 'Failed to retrieve sanctuary zones.' });
    }
};

/* ── GET single zone with full enclosure + animal detail (public) ── */
export const getZoneById = async (req, res) => {
    try {
        const zone_id = req.params.id;

        if (isNaN(zone_id)) {
            return res.status(400).json({ success: false, error: 'Invalid zone ID.' });
        }

        const zone = await prisma.zone.findUnique({
            where: { zone_id },
            include: {
                enclosures: {
                    include: {
                        animals: {
                            select: {
                                animal_id: true,
                                species: true,
                                nickname: true,
                                health_status: true,
                            }
                        }
                    },
                    orderBy: { enclosure_id: 'asc' }
                },
                _count: {
                    select: { tickets: true }
                }
            }
        });

        if (!zone) {
            return res.status(404).json({ success: false, error: 'Zone not found.' });
        }

        return res.status(200).json({ success: true, zone });
    } catch (error) {
        console.error('🔥 Zone Detail Fetch Error:', error);
        return res.status(500).json({ success: false, error: 'Failed to retrieve zone details.' });
    }
};