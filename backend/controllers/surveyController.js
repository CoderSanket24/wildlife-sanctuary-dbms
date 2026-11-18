import prisma from '../config/prisma.js';
import { invalidateCache } from '../utils/cache.js';

// Realistic geographic layout for Abhayarnya Sanctuary (Nilgiri-Bandipur Biosphere Complex)
const ZONE_SPATIAL_METADATA = {
  'Savannah & Open Grasslands': {
    center: [11.6520, 76.6340],
    radius: 1500,
    color: '#eab308',
    fillColor: '#fef08a',
    description: 'Expansive open savanna habitat sustaining herbivores, prides of lions, and elephant herds.'
  },
  'Western Ghats Dense Rainforest': {
    center: [11.6780, 76.6080],
    radius: 1800,
    color: '#10b981',
    fillColor: '#6ee7b7',
    description: 'Dense tropical evergreen canopy with perennial streams, primary tiger and leopard territory.'
  },
  'Himalayan High Altitude Reserve': {
    center: [11.6950, 76.5920],
    radius: 1400,
    color: '#06b6d4',
    fillColor: '#a5f3fc',
    description: 'Steep alpine terrain, rocky outcroppings, and cold microclimates for elusive mountain species.'
  },
  'Sundarbans Mangrove Wetland': {
    center: [11.6880, 76.6480],
    radius: 1600,
    color: '#3b82f6',
    fillColor: '#93c5fd',
    description: 'Tidal mangrove creeks, marshlands, and mudflats hosting rhinos, muggers, and waterfowl.'
  },
  'Thar Desert Arid Enclave': {
    center: [11.6420, 76.6550],
    radius: 1300,
    color: '#f97316',
    fillColor: '#fdba74',
    description: 'Arid sand dunes and xerophytic scrublands tailored for desert gazelles, blackbucks, and reptiles.'
  },
  'Nilgiri Shola Forest': {
    center: [11.6320, 76.6110],
    radius: 1400,
    color: '#84cc16',
    fillColor: '#bef264',
    description: 'Mosaic of montane evergreen shola forests and rolling grasslands sheltering endemic tahrs.'
  }
};

/**
 * GET /api/fauna/telemetry — Fetch geospatial telemetry for interactive sanctuary map
 * Returns zones with coordinates, enclosures, camera trap sensors, and animal sightings.
 */
export const getSanctuaryTelemetry = async (req, res) => {
  try {
    // 1. Fetch all zones with enclosure and animal relations
    const rawZones = await prisma.zone.findMany({
      include: {
        enclosures: {
          select: {
            enclosure_id: true,
            code_name: true,
            max_capacity: true,
            current_occupancy: true,
            _count: { select: { animals: true } }
          }
        }
      },
      orderBy: { zone_id: 'asc' }
    });

    // 2. Fetch recent animal surveys with animal details
    const rawSurveys = await prisma.survey.findMany({
      take: 50,
      orderBy: { survey_date: 'desc' },
      include: {
        animal: {
          select: {
            animal_id: true,
            species: true,
            scientific_name: true,
            nickname: true,
            health_status: true,
            enclosure: {
              select: {
                code_name: true,
                zone: { select: { zone_id: true, name: true, climate: true } }
              }
            }
          }
        }
      }
    });

    // 3. Format zones with spatial geometry
    const sanctuaryCenter = [11.6681, 76.6200];
    const zones = rawZones.map((z, idx) => {
      const meta = ZONE_SPATIAL_METADATA[z.name] || {
        center: [
          sanctuaryCenter[0] + (idx % 2 === 0 ? 0.015 : -0.015) * (idx + 1) * 0.4,
          sanctuaryCenter[1] + (idx % 3 === 0 ? 0.015 : -0.015) * (idx + 1) * 0.4
        ],
        radius: 1200,
        color: '#a3e635',
        fillColor: '#d9f99d',
        description: `${z.name} natural habitat enclosure.`
      };

      const totalAnimals = z.enclosures.reduce((sum, enc) => sum + enc._count.animals, 0);

      return {
        zone_id: z.zone_id,
        name: z.name,
        climate: z.climate,
        camera_traps_count: z.camera_traps_count,
        ticket_price: parseFloat(z.ticket_price),
        max_daily_capacity: z.max_daily_capacity,
        center: meta.center,
        radius: meta.radius,
        color: meta.color,
        fillColor: meta.fillColor,
        description: meta.description,
        enclosures_count: z.enclosures.length,
        animals_count: totalAnimals,
        enclosures: z.enclosures
      };
    });

    // 4. Generate Camera Trap sensors for each zone
    const cameraTraps = [];
    zones.forEach((z) => {
      const trapCount = Math.min(z.camera_traps_count || 4, 6);
      const [cLat, cLng] = z.center;
      const angleStep = (2 * Math.PI) / trapCount;
      const distOffset = 0.007; // ~750m from zone center

      for (let i = 0; i < trapCount; i++) {
        const angle = i * angleStep;
        const lat = +(cLat + distOffset * Math.cos(angle)).toFixed(6);
        const lng = +(cLng + distOffset * Math.sin(angle)).toFixed(6);
        cameraTraps.push({
          trap_id: `CT-${z.zone_id}-${String.fromCharCode(65 + i)}`,
          zone_id: z.zone_id,
          zone_name: z.name,
          name: `${z.name.split(' ')[0]} Sensor #${i + 1}`,
          latitude: lat,
          longitude: lng,
          status: i === 3 ? 'RECORDING' : 'ONLINE',
          battery_pct: 82 + ((i * 5) % 18),
          signal: '4G LTE (Encrypted)',
          last_ping: new Date(Date.now() - (i * 12 + 4) * 60000).toISOString()
        });
      }
    });

    // 5. Format animal survey sightings
    const sightings = rawSurveys.map((s) => ({
      survey_id: String(s.survey_id),
      animal_id: s.animal_id,
      nickname: s.animal?.nickname || 'Specimen',
      species: s.animal?.species || 'Fauna',
      scientific_name: s.animal?.scientific_name || '',
      health_status: s.animal?.health_status || 'HEALTHY',
      sighting_count: s.sighting_count,
      latitude: parseFloat(s.latitude),
      longitude: parseFloat(s.longitude),
      survey_date: s.survey_date,
      zone_name: s.animal?.enclosure?.zone?.name || 'Sanctuary Enclosure',
      enclosure_code: s.animal?.enclosure?.code_name || 'Free Roam'
    }));

    return res.status(200).json({
      success: true,
      telemetry: {
        sanctuary_name: 'Abhayarnya Wildlife Biosphere Reserve',
        center: sanctuaryCenter,
        default_zoom: 13,
        total_zones: zones.length,
        total_sightings: sightings.length,
        total_camera_traps: cameraTraps.length,
        zones,
        camera_traps: cameraTraps,
        sightings
      }
    });
  } catch (error) {
    console.error('🔥 Telemetry Fetch Error:', error);
    return res.status(500).json({ success: false, error: 'Failed to retrieve sanctuary telemetry.' });
  }
};

/**
 * POST /api/fauna/surveys — Record field survey sighting
 */
export const logFaunaSurvey = async (req, res) => {
  try {
    const { animal_id, sighting_count, latitude, longitude } = req.body;

    const animalExists = await prisma.animal.findUnique({
      where: { animal_id }
    });

    if (!animalExists) {
      return res.status(404).json({ success: false, error: 'Data Mismatch: Target animal specimen ID does not exist.' });
    }

    const newSurvey = await prisma.survey.create({
      data: {
        animal_id,
        sighting_count: sighting_count || 1,
        latitude,
        longitude
      }
    });

    // Invalidate cached telemetry and stats
    invalidateCache(['telemetry', 'stats', 'sanctuary']);

    return res.status(201).json({
      success: true,
      message: 'Telemetry camera trap field data recorded successfully.',
      survey: {
        ...newSurvey,
        survey_id: String(newSurvey.survey_id),
        latitude: parseFloat(newSurvey.latitude),
        longitude: parseFloat(newSurvey.longitude)
      }
    });
  } catch (error) {
    console.error('🔥 Field Survey Log Aborted:', error);
    return res.status(500).json({ success: false, error: 'Failed to commit coordinate log to database disk.' });
  }
};
