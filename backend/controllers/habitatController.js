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