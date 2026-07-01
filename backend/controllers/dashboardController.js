import prisma from '../config/prisma.js';

/**
 * GET /api/dashboard/stats
 * Returns aggregate counts for the dashboard stat cards.
 * - health_alerts: sourced from vw_health_alerts (CRITICAL + UNDER_CARE animals)
 * - active_zones, animals_tracked: simple Prisma counts
 * - my_bookings: visitor-scoped Prisma count
 * All queries run in parallel via Promise.all.
 */
export const getDashboardStats = async (req, res) => {
  try {
    const { visitor_id } = req.user;

    const [
      zoneCount,
      animalCount,
      myBookingsCount,
      alertRows,
    ] = await Promise.all([
      // Total active zones
      prisma.zone.count(),

      // Total animals tracked
      prisma.animal.count(),

      // This visitor's ticket bookings
      prisma.ticket.count({ where: { visitor_id } }),

      // Health alerts — read directly from the view (CRITICAL + UNDER_CARE)
      prisma.$queryRaw`SELECT COUNT(*)::INT AS cnt FROM vw_health_alerts`,
    ]);

    return res.status(200).json({
      success: true,
      stats: {
        active_zones:    zoneCount,
        animals_tracked: animalCount,
        my_bookings:     myBookingsCount,
        health_alerts:   alertRows[0]?.cnt ?? 0,
      }
    });
  } catch (error) {
    console.error('🔥 Dashboard Stats Error:', error);
    return res.status(500).json({ success: false, error: 'Failed to load dashboard stats.' });
  }
};

/**
 * GET /api/dashboard/alerts
 * Returns the full list of animals from vw_health_alerts.
 * Used to power a health-alert detail panel if needed.
 */
export const getHealthAlerts = async (req, res) => {
  try {
    const alerts = await prisma.$queryRaw`
      SELECT
        animal_id,
        species,
        nickname,
        health_status,
        enclosure_name,
        zone_id,
        zone_name,
        last_logged_at,
        last_diagnosis,
        last_treatment,
        require_isolation,
        attending_vet
      FROM vw_health_alerts
      ORDER BY
        CASE health_status
          WHEN 'CRITICAL'   THEN 1
          WHEN 'UNDER_CARE' THEN 2
          ELSE 3
        END,
        last_logged_at DESC NULLS LAST
    `;

    return res.status(200).json({ success: true, alerts });
  } catch (error) {
    console.error('🔥 Health Alerts Fetch Error:', error);
    return res.status(500).json({ success: false, error: 'Failed to load health alerts.' });
  }
};
