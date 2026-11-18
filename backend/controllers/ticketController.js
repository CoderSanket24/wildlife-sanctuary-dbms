import prisma from '../config/prisma.js';
import { sendEmail } from '../utils/mailer.js';
import { generateTicketPdf } from '../utils/ticketPdf.js';

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
                    select: { name: true, climate: true }
                },
                visitor: {
                    select: { email: true, first_name: true, last_name: true }
                }
            }
        });

        // Demonstrates Unit III: Transport Layer (WebSockets)
        if (req.app.locals.io) {
            req.app.locals.io.emit('new_ticket', activeTicket);
        }

        // Demonstrates Unit III: Application Layer (SMTP + MIME PDF Attachment)
        // Run in background (fire-and-forget) to prevent HTTP timeouts
        if (activeTicket && activeTicket.visitor?.email) {
            (async () => {
                try {
                    const pdfBuffer = await generateTicketPdf(activeTicket);
                    sendEmail(
                        activeTicket.visitor.email,
                        `Ticket Confirmed: ${activeTicket.zone.name} Safari (Pass Attached)`,
                        `Hi ${activeTicket.visitor.first_name},\n\nYour safari ticket for the ${activeTicket.zone.name} zone has been successfully booked!\n\nYour official digital pass with scannable QR code is attached to this email as a PDF.\n\nTotal Paid: ₹${activeTicket.total_amount}\nBooking Date: ${new Date(activeTicket.booking_date).toLocaleString()}\n\nThank you for supporting Abhayarnya Wildlife Sanctuary!`,
                        [
                            {
                                filename: `Abhayarnya_Ticket_${activeTicket.ticket_id}.pdf`,
                                content: pdfBuffer,
                                contentType: 'application/pdf',
                            }
                        ]
                    );
                } catch (pdfErr) {
                    console.error('[Ticket PDF Generation Error]', pdfErr.message);
                    sendEmail(
                        activeTicket.visitor.email,
                        `Ticket Confirmed: ${activeTicket.zone.name} Safari`,
                        `Hi ${activeTicket.visitor.first_name},\n\nYour safari ticket for the ${activeTicket.zone.name} zone has been successfully booked!\n\nTotal Paid: ₹${activeTicket.total_amount}\nBooking Date: ${new Date(activeTicket.booking_date).toLocaleString()}\n\nThank you for supporting the Wildlife Sanctuary!`
                    );
                }
            })();
        }

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

/* ── GET /api/tickets/:id/pdf ── Download or stream PDF ticket pass ── */
export const downloadTicketPdf = async (req, res) => {
  try {
    const ticketId = BigInt(req.params.id);

    const ticket = await prisma.ticket.findUnique({
      where: { ticket_id: ticketId },
      include: {
        zone: { select: { name: true, climate: true, ticket_price: true } },
        visitor: { select: { visitor_id: true, first_name: true, last_name: true, email: true } },
      },
    });

    if (!ticket) {
      return res.status(404).json({ success: false, error: 'Ticket pass not found.' });
    }

    // Access authorization: only the ticket owner, Staff, or Admin can access
    const isOwner = ticket.visitor.visitor_id === req.user.visitor_id;
    const isStaffOrAdmin = req.user.role === 'STAFF' || req.user.role === 'ADMIN';

    if (!isOwner && !isStaffOrAdmin) {
      return res.status(403).json({ success: false, error: 'Access Denied: You do not own this ticket.' });
    }

    const pdfBuffer = await generateTicketPdf(ticket);

    res.setHeader('Content-Type', 'application/pdf');
    res.setHeader('Content-Disposition', `inline; filename="Abhayarnya_Ticket_${ticket.ticket_id}.pdf"`);
    res.setHeader('Content-Length', pdfBuffer.length);

    return res.end(pdfBuffer);
  } catch (error) {
    console.error('🔥 Ticket PDF Download Error:', error);
    return res.status(500).json({ success: false, error: 'Failed to generate ticket PDF.' });
  }
};

/* ── GET /api/tickets/verify/:id ── Verification for QR scanner ── */
export const verifyTicket = async (req, res) => {
  try {
    const ticketId = BigInt(req.params.id);

    const ticket = await prisma.ticket.findUnique({
      where: { ticket_id: ticketId },
      include: {
        zone: { select: { name: true, climate: true } },
        visitor: { select: { first_name: true, last_name: true, email: true } },
      },
    });

    if (!ticket) {
      return res.status(404).json({ success: false, valid: false, message: 'Invalid pass: Ticket not found in registry.' });
    }

    return res.status(200).json({
      success: true,
      valid: true,
      ticket: {
        ticket_id: ticket.ticket_id.toString(),
        status: ticket.status || 'CONFIRMED',
        visitor_name: `${ticket.visitor.first_name} ${ticket.visitor.last_name}`,
        email: ticket.visitor.email,
        zone: ticket.zone.name,
        climate: ticket.zone.climate,
        booking_date: ticket.booking_date,
        checked_in_at: ticket.checked_in_at,
        total_amount: ticket.total_amount,
      },
    });
  } catch (error) {
    console.error('🔥 Ticket Verification Error:', error);
    return res.status(500).json({ success: false, error: 'Internal failure during ticket verification.' });
  }
};

/* ── POST /api/tickets/check-in ── Staff gate entry validation ── */
export const checkInTicket = async (req, res) => {
  try {
    const { ticket_id } = req.body;

    if (!ticket_id) {
      return res.status(400).json({ success: false, error: 'Ticket ID is required for gate check-in.' });
    }

    const ticketId = BigInt(ticket_id);

    const existingTicket = await prisma.ticket.findUnique({
      where: { ticket_id: ticketId },
      include: {
        zone: { select: { name: true, climate: true } },
        visitor: { select: { first_name: true, last_name: true, email: true } },
      },
    });

    if (!existingTicket) {
      return res.status(404).json({ success: false, error: 'Ticket pass does not exist.' });
    }

    // Check if already checked in
    if (existingTicket.status === 'CHECKED_IN') {
      return res.status(409).json({
        success: false,
        alreadyCheckedIn: true,
        message: `ALREADY USED: Ticket #${existingTicket.ticket_id} was checked in on ${new Date(existingTicket.checked_in_at).toLocaleString('en-IN')}.`,
        ticket: existingTicket,
      });
    }

    // Mark as checked in
    const updatedTicket = await prisma.ticket.update({
      where: { ticket_id: ticketId },
      data: {
        status: 'CHECKED_IN',
        checked_in_at: new Date(),
      },
      include: {
        zone: { select: { name: true, climate: true } },
        visitor: { select: { first_name: true, last_name: true, email: true } },
      },
    });

    // Real-time broadcast to Admin/Staff dashboard
    if (req.app.locals.io) {
      req.app.locals.io.emit('ticket_checked_in', updatedTicket);
    }

    return res.status(200).json({
      success: true,
      message: `ENTRY GRANTED: Welcome ${updatedTicket.visitor.first_name} ${updatedTicket.visitor.last_name} to ${updatedTicket.zone.name}!`,
      ticket: updatedTicket,
    });
  } catch (error) {
    console.error('🔥 Gate Check-In Processing Error:', error);
    return res.status(500).json({ success: false, error: 'Failed to process gate check-in.' });
  }
};

