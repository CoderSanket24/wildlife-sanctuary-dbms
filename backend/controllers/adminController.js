import prisma from '../config/prisma.js';

/* ──────────────────────────────────────────
   VISITORS
────────────────────────────────────────── */

/** GET /api/admin/visitors — all visitors with booking count */
export const getAllVisitors = async (req, res) => {
  try {
    const visitors = await prisma.visitor.findMany({
      select: {
        visitor_id: true,
        first_name: true,
        last_name:  true,
        email:      true,
        age:        true,
        role:       true,
        created_at: true,
        _count: { select: { tickets: true } },
      },
      orderBy: { visitor_id: 'asc' },
    });
    return res.status(200).json({ success: true, visitors });
  } catch (error) {
    console.error('🔥 Admin – Visitor Fetch Error:', error);
    return res.status(500).json({ success: false, error: 'Failed to fetch visitors.' });
  }
};

/** PUT /api/admin/visitors/:id/role — change a visitor's role */
export const updateVisitorRole = async (req, res) => {
  try {
    const visitor_id = parseInt(req.params.id, 10);
    const { role }   = req.body;

    const VALID_ROLES = ['VISITOR', 'RANGER', 'ADMIN'];
    if (!VALID_ROLES.includes(role)) {
      return res.status(400).json({ success: false, error: `Invalid role. Must be one of: ${VALID_ROLES.join(', ')}` });
    }

    const updated = await prisma.visitor.update({
      where: { visitor_id },
      data:  { role },
      select: { visitor_id: true, first_name: true, last_name: true, email: true, role: true },
    });

    return res.status(200).json({ success: true, message: 'Visitor role updated.', visitor: updated });
  } catch (error) {
    console.error('🔥 Admin – Role Update Error:', error);
    if (error.code === 'P2025') {
      return res.status(404).json({ success: false, error: 'Visitor not found.' });
    }
    return res.status(500).json({ success: false, error: 'Failed to update role.' });
  }
};

/* ──────────────────────────────────────────
   STAFF
────────────────────────────────────────── */

/** GET /api/admin/staff — all staff members */
export const getAllStaff = async (req, res) => {
  try {
    const staff = await prisma.staff.findMany({
      include: {
        visitors: {
          select: { visitor_id: true, first_name: true, last_name: true, email: true, role: true, created_at: true },
        },
        _count: { select: { medical_cases: true } },
      },
      orderBy: { staff_id: 'asc' },
    });
    return res.status(200).json({ success: true, staff });
  } catch (error) {
    console.error('🔥 Admin – Staff Fetch Error:', error);
    return res.status(500).json({ success: false, error: 'Failed to fetch staff.' });
  }
};

/** POST /api/admin/staff — promote a visitor to staff
 *  Body: { visitor_id, role, first_name, last_name, email }
 *  Staff.staff_id = Visitor.visitor_id (same PK, shared entity pattern)
 */
export const createStaffMember = async (req, res) => {
  try {
    const { visitor_id, role, first_name, last_name, email } = req.body;

    if (!visitor_id || !role || !first_name || !last_name || !email) {
      return res.status(400).json({ success: false, error: 'All fields are required: visitor_id, role, first_name, last_name, email.' });
    }

    // Verify visitor exists
    const visitor = await prisma.visitor.findUnique({ where: { visitor_id: parseInt(visitor_id, 10) } });
    if (!visitor) {
      return res.status(404).json({ success: false, error: 'Visitor not found.' });
    }

    // Create staff record (shared PK with visitor)
    const staff = await prisma.staff.create({
      data: {
        staff_id:   parseInt(visitor_id, 10),
        first_name,
        last_name,
        role,
        email,
      },
    });

    // Also promote their Visitor role to RANGER if they're still VISITOR
    if (visitor.role === 'VISITOR') {
      await prisma.visitor.update({
        where: { visitor_id: parseInt(visitor_id, 10) },
        data:  { role: 'RANGER' },
      });
    }

    return res.status(201).json({ success: true, message: 'Staff member registered.', staff });
  } catch (error) {
    console.error('🔥 Admin – Staff Creation Error:', error);
    if (error.code === 'P2002') {
      return res.status(409).json({ success: false, error: 'This visitor is already a staff member.' });
    }
    return res.status(500).json({ success: false, error: 'Failed to create staff member.' });
  }
};

/* ──────────────────────────────────────────
   ANIMALS
────────────────────────────────────────── */

/** PUT /api/admin/animals/:id/status — update an animal's health status */
export const updateAnimalStatus = async (req, res) => {
  try {
    const animal_id = parseInt(req.params.id, 10);
    const { health_status } = req.body;

    const VALID = ['HEALTHY', 'UNDER_CARE', 'CRITICAL', 'QUARANTINED'];
    if (!VALID.includes(health_status)) {
      return res.status(400).json({ success: false, error: `Invalid status. Must be one of: ${VALID.join(', ')}` });
    }

    const animal = await prisma.animal.update({
      where: { animal_id },
      data:  { health_status },
      select: { animal_id: true, species: true, nickname: true, health_status: true },
    });

    return res.status(200).json({ success: true, message: 'Animal status updated.', animal });
  } catch (error) {
    console.error('🔥 Admin – Animal Status Update Error:', error);
    if (error.code === 'P2025') {
      return res.status(404).json({ success: false, error: 'Animal not found.' });
    }
    return res.status(500).json({ success: false, error: 'Failed to update animal status.' });
  }
};

/** DELETE /api/admin/animals/:id — remove an animal */
export const deleteAnimal = async (req, res) => {
  try {
    const animal_id = parseInt(req.params.id, 10);
    await prisma.animal.delete({ where: { animal_id } });
    return res.status(200).json({ success: true, message: 'Animal removed from registry.' });
  } catch (error) {
    console.error('🔥 Admin – Animal Delete Error:', error);
    if (error.code === 'P2025') {
      return res.status(404).json({ success: false, error: 'Animal not found.' });
    }
    return res.status(500).json({ success: false, error: 'Failed to delete animal.' });
  }
};

/* ──────────────────────────────────────────
   ZONES
────────────────────────────────────────── */

/** DELETE /api/admin/zones/:id — remove a zone (cascades to enclosures/animals/tickets) */
export const deleteZone = async (req, res) => {
  try {
    const zone_id = parseInt(req.params.id, 10);
    await prisma.zone.delete({ where: { zone_id } });
    return res.status(200).json({ success: true, message: 'Zone deleted.' });
  } catch (error) {
    console.error('🔥 Admin – Zone Delete Error:', error);
    if (error.code === 'P2025') {
      return res.status(404).json({ success: false, error: 'Zone not found.' });
    }
    return res.status(500).json({ success: false, error: 'Failed to delete zone.' });
  }
};

/* ──────────────────────────────────────────
   TICKETS (all visitors)
────────────────────────────────────────── */

/** GET /api/admin/tickets — all tickets across all visitors */
export const getAllTickets = async (req, res) => {
  try {
    const [tickets, totals] = await Promise.all([
      prisma.ticket.findMany({
        orderBy: { booking_date: 'desc' },
        include: {
          visitor: { select: { visitor_id: true, first_name: true, last_name: true, email: true } },
          zone:    { select: { zone_id: true, name: true, climate: true } },
        },
      }),
      prisma.ticket.aggregate({
        _count: { ticket_id: true },
        _sum:   { total_amount: true },
      }),
    ]);

    return res.status(200).json({
      success: true,
      tickets,
      summary: {
        total_tickets:  totals._count.ticket_id,
        total_revenue:  parseFloat(totals._sum.total_amount ?? 0),
      },
    });
  } catch (error) {
    console.error('🔥 Admin – All Tickets Fetch Error:', error);
    return res.status(500).json({ success: false, error: 'Failed to fetch tickets.' });
  }
};

/* ──────────────────────────────────────────
   OVERVIEW STATS
────────────────────────────────────────── */

/** GET /api/admin/stats — aggregate counts for the admin overview */
export const getAdminStats = async (req, res) => {
  try {
    const [visitorCount, staffCount, animalCount, ticketAgg, zoneCount] = await Promise.all([
      prisma.visitor.count(),
      prisma.staff.count(),
      prisma.animal.count(),
      prisma.ticket.aggregate({ _count: { ticket_id: true }, _sum: { total_amount: true } }),
      prisma.zone.count(),
    ]);

    return res.status(200).json({
      success: true,
      stats: {
        total_visitors: visitorCount,
        total_staff:    staffCount,
        total_animals:  animalCount,
        total_zones:    zoneCount,
        total_tickets:  ticketAgg._count.ticket_id,
        total_revenue:  parseFloat(ticketAgg._sum.total_amount ?? 0),
      },
    });
  } catch (error) {
    console.error('🔥 Admin – Stats Error:', error);
    return res.status(500).json({ success: false, error: 'Failed to fetch admin stats.' });
  }
};
