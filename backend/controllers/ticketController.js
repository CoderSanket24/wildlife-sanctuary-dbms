import prisma from '../config/prisma.js';

export const purchaseSafariTicket = async (req, res) => {
    try {
        const { visitor_id } = req.user;
        const {zone_id} = req.body;

        if (isNaN(zone_id)) {
            return res.status(400).json({ error: 'Zone ID is required' });
        }

        const result = await prisma.$queryRaw`
            SELECT fn_book_safari_ticket(${visitor_id}::INT, ${zone_id}::INT) AS status
        `;

        const isSuccess = result[0]?.status;

        if (!isSuccess) {
            return res.status(400).json({ success: false, error: 'Transactional Failure: The booking ledger could not be finalized by the engine.' });
        }

        const activeTicket = await prisma.ticket.findFirst({
            where: {
                visitor_id: visitor_id,
                zone_id: zone_id,
            },
            orderBy: {
                booking_date: 'desc'
            },
            include: {
                zone: {
                    select: {
                        name: true,
                        climate: true
                    }
                }
            }
        });

        return res.status(200).json({ success: true, message: 'Safari ticket successfully issued. Transaction sealed.', ticket: activeTicket });
    } catch (error) {
        console.error('🔥 Transactional Booking Pipeline Aborted:', error.message);
        if (error.message.includes('Transaction Aborted')) {
            return res.status(400).json({
                success: false,
                error: `Database Ledger Constraint: ${error.message.split('ERROR:')[1]?.trim() || error.message}`
            });
        }
        return res.status(500).json({ success: false, error: 'Critical server failure processing ticket financial rows.' })
    }
}

/* ── GET /api/ticket/my  ── visitor's ticket history + spend summary ── */
export const getMyTickets = async (req, res) => {
  try {
    const { visitor_id } = req.user;

    // Run both queries in parallel:
    // 1. Full ticket list (with zone detail) — Prisma relational query
    // 2. Aggregated spend summary from vw_visitor_booking_summary
    const [tickets, summaryRows] = await Promise.all([
      prisma.ticket.findMany({
        where: { visitor_id },
        orderBy: { booking_date: 'desc' },
        include: {
          zone: {
            select: {
              zone_id:      true,
              name:         true,
              climate:      true,
              ticket_price: true,
            }
          }
        }
      }),

      prisma.$queryRaw`
        SELECT
          total_bookings,
          zones_visited,
          total_spent,
          avg_ticket_cost,
          last_booking_date
        FROM vw_visitor_booking_summary
        WHERE visitor_id = ${visitor_id}
      `,
    ]);

    const summary = summaryRows[0] ?? null;

    return res.status(200).json({
      success: true,
      tickets,
      summary: summary ? {
        total_bookings:    Number(summary.total_bookings),
        zones_visited:     Number(summary.zones_visited),
        total_spent:       parseFloat(summary.total_spent),
        avg_ticket_cost:   parseFloat(summary.avg_ticket_cost),
        last_booking_date: summary.last_booking_date,
      } : null,
    });
  } catch (error) {
    console.error('🔥 Ticket History Fetch Error:', error.message);
    return res.status(500).json({ success: false, error: 'Failed to retrieve ticket history.' });
  }
};
