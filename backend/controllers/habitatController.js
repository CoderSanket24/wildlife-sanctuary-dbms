import prisma from '../config/prisma.js'

export const createEnclosure = async (req, res) => {
  try {
    const { zone_id, code_name, max_capacity } = req.body;

    const newEnclosure = await prisma.enclosure.create({
      data: {
        zone_id,
        code_name,
        max_capacity
      }
    });

    return res.status(201).json({
      success: true,
      message: 'Physical habitat enclosure deployed to registry.',
      enclosure: newEnclosure
    });
  } catch (error) {
    console.error('🔥 Enclosure Deployment Blocked:', error);
    if (error.code === 'P2002') {
      return res.status(409).json({ success: false, error: 'Database Collision: An enclosure code name must be unique.' });
    }
    return res.status(500).json({ success: false, error: 'Internal server error constructing enclosure data rows.' });
  }
};

export const registerAnimal = async (req, res) => {
  try {
    const { enclosure_id, species, scientific_name, nickname, birth_date, health_status } = req.body;

    const newAnimal = await prisma.animal.create({
      data: {
        enclosure_id,
        species,
        scientific_name,
        nickname,
        birth_date: birth_date ? new Date(birth_date) : null,
        health_status: health_status || 'HEALTHY'
      }
    });

    return res.status(201).json({
      success: true,
      message: 'Fauna specimen safely processed and placed into target enclosure.',
      animal: newAnimal
    });
  } catch (error) {
    console.error('🔥 Specimen Placement Aborted:', error.message);

    if (error.message.includes('PostgreSQL Integrity Block')) {
      return res.status(400).json({
        success: false,
        error: `Capacity Boundary Breach: ${error.message.split('ERROR:')[1]?.trim() || error.message}`
      });
    }

    return res.status(500).json({ success: false, error: 'Critical server error writing animal record to disk.' });
  }
};

export const getAllAnimals = async (req, res) => {
  try {
    const { status, species, search } = req.query;

    const where = {};
    if (status)  where.health_status = status;
    if (species) where.species = { contains: species, mode: 'insensitive' };
    if (search)  where.OR = [
      { species:         { contains: search, mode: 'insensitive' } },
      { nickname:        { contains: search, mode: 'insensitive' } },
      { scientific_name: { contains: search, mode: 'insensitive' } },
    ];

    const animals = await prisma.animal.findMany({
      where,
      include: {
        enclosure: {
          select: {
            enclosure_id: true,
            code_name:    true,
            zone: {
              select: { zone_id: true, name: true, climate: true }
            }
          }
        },
        _count: {
          select: { surveys: true, health_logs: true }
        }
      },
      orderBy: { animal_id: 'asc' }
    });

    return res.status(200).json({ success: true, animals });
  } catch (error) {
    console.error('🔥 Animal Fetch Error:', error);
    return res.status(500).json({ success: false, error: 'Failed to retrieve animals.' });
  }
};

export const getAnimalById = async (req, res) => {
  try {
    const animal_id = parseInt(req.params.id, 10);
    if (isNaN(animal_id)) {
      return res.status(400).json({ success: false, error: 'Invalid animal ID.' });
    }

    const animal = await prisma.animal.findUnique({
      where: { animal_id },
      include: {
        enclosure: {
          include: {
            zone: { select: { zone_id: true, name: true, climate: true } }
          }
        },
        health_logs: {
          orderBy: { logged_at: 'desc' },
          take: 10,
          include: {
            veterinarian: {
              select: {
                first_name: true,
                last_name:  true,
                role:       true,
              }
            }
          }
        },
        surveys: {
          orderBy: { survey_date: 'desc' },
          take: 5,
          select: {
            survey_id:     true,
            survey_date:   true,
            sighting_count: true,
            latitude:      true,
            longitude:     true,
          }
        },
        _count: {
          select: { surveys: true, health_logs: true }
        }
      }
    });

    if (!animal) {
      return res.status(404).json({ success: false, error: 'Animal not found.' });
    }

    return res.status(200).json({ success: true, animal });
  } catch (error) {
    console.error('🔥 Animal Detail Fetch Error:', error);
    return res.status(500).json({ success: false, error: 'Failed to retrieve animal details.' });
  }
};
