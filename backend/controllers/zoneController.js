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

/* ── GET all zones — powered by vw_zone_summary ── */
export const getAllZones = async (req, res) => {
    try {
        // vw_zone_summary pre-joins zones → enclosures → animals → tickets
        // and returns all aggregate stats in one query instead of N+1 Prisma calls.
        const rows = await prisma.$queryRaw`
            SELECT
                zone_id,
                zone_name        AS name,
                climate,
                camera_traps_count,
                ticket_price,
                enclosure_count,
                total_animals,
                total_capacity,
                total_occupancy,
                occupancy_pct,
                tickets_sold,
                total_revenue
            FROM vw_zone_summary
            ORDER BY zone_id ASC
        `;

        // Normalise Decimal/BigInt types returned by the pg driver
        const zones = rows.map(r => ({
            ...r,
            ticket_price:   parseFloat(r.ticket_price),
            occupancy_pct:  parseFloat(r.occupancy_pct),
            total_revenue:  parseFloat(r.total_revenue),
            enclosure_count: Number(r.enclosure_count),
            total_animals:  Number(r.total_animals),
            total_capacity: Number(r.total_capacity),
            total_occupancy: Number(r.total_occupancy),
            tickets_sold:   Number(r.tickets_sold),
        }));

        return res.status(200).json({ success: true, zones });
    } catch (error) {
        console.error('🔥 Zone Fetch Error:', error);
        return res.status(500).json({ success: false, error: 'Failed to retrieve sanctuary zones.' });
    }
};

/* ── GET single zone — summary stats from vw_zone_summary,
       full enclosure+animal detail from Prisma ── */
export const getZoneById = async (req, res) => {
    try {
        const zone_id = parseInt(req.params.id, 10);

        if (isNaN(zone_id)) {
            return res.status(400).json({ success: false, error: 'Invalid zone ID.' });
        }

        // 1. Aggregate stats row from the view
        const [summary] = await prisma.$queryRaw`
            SELECT
                zone_id,
                zone_name        AS name,
                climate,
                camera_traps_count,
                ticket_price,
                enclosure_count,
                total_animals,
                total_capacity,
                total_occupancy,
                occupancy_pct,
                tickets_sold,
                total_revenue
            FROM vw_zone_summary
            WHERE zone_id = ${zone_id}
        `;

        if (!summary) {
            return res.status(404).json({ success: false, error: 'Zone not found.' });
        }

        // 2. Full enclosure + animal list (relational — view can't provide this detail)
        const zone = await prisma.zone.findUnique({
            where: { zone_id },
            include: {
                enclosures: {
                    include: {
                        animals: {
                            select: {
                                animal_id:     true,
                                species:       true,
                                nickname:      true,
                                health_status: true,
                            }
                        }
                    },
                    orderBy: { enclosure_id: 'asc' }
                }
            }
        });

        return res.status(200).json({
            success: true,
            zone: {
                // Merge view stats + Prisma relational data
                zone_id:            zone_id,
                name:               summary.name,
                climate:            summary.climate,
                camera_traps_count: summary.camera_traps_count,
                ticket_price:       parseFloat(summary.ticket_price),
                enclosure_count:    Number(summary.enclosure_count),
                total_animals:      Number(summary.total_animals),
                total_capacity:     Number(summary.total_capacity),
                total_occupancy:    Number(summary.total_occupancy),
                occupancy_pct:      parseFloat(summary.occupancy_pct),
                tickets_sold:       Number(summary.tickets_sold),
                total_revenue:      parseFloat(summary.total_revenue),
                enclosures:         zone.enclosures,
            }
        });
    } catch (error) {
        console.error('🔥 Zone Detail Fetch Error:', error);
        return res.status(500).json({ success: false, error: 'Failed to retrieve zone details.' });
    }
};