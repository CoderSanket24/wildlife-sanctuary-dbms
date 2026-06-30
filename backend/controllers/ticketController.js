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

export const getMyTickets = async (req, res) => {
  try {
    const { visitor_id } = req.user;

    const tickets = await prisma.ticket.findMany({
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
    });

    return res.status(200).json({ success: true, tickets });
  } catch (error) {
    console.error('🔥 Ticket History Fetch Error:', error.message);
    return res.status(500).json({ success: false, error: 'Failed to retrieve ticket history.' });
  }
};
