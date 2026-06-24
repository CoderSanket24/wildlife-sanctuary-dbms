import prisma from '../config/prisma.js'

export const createHealthLog = async (req, res) => {
  try {
    const { animal_id, veterinarian_id, diagnosis, treatment, require_isolation } = req.body;

    // 1. Verify the targeted animal specimen exists
    const animalExists = await prisma.animal.findUnique({
      where: { animal_id: parseInt(animal_id, 10) }
    });

    if (!animalExists) {
      return res.status(404).json({ success: false, error: 'Data Mismatch: Target fauna specimen does not exist.' });
    }

    // 2. Commit the medical log to the database disk
    const newLog = await prisma.healthLog.create({
      data: {
        animal_id: parseInt(animal_id, 10),
        veterinarian_id: parseInt(veterinarian_id, 10),
        diagnosis,
        treatment,
        require_isolation: !!require_isolation
      }
    });

    // 3. Optional Operational Automation: If the animal requires isolation, 
    // update its primary health status to 'QUARANTINED' automatically!
    if (require_isolation) {
      await prisma.animal.update({
        where: { animal_id: parseInt(animal_id, 10) },
        data: { health_status: 'QUARANTINED' }
      });
    }

    return res.status(201).json({
      success: true,
      message: 'Fauna medical log saved to clinical database.',
      log: newLog
    });
  } catch (error) {
    console.error('🔥 Medical Logging Error:', error);
    return res.status(500).json({ success: false, error: 'Internal failure writing medical rows.' });
  }
};

export const getAnimalMedicalHistory = async (req, res) => {
  try {
    const animalId = parseInt(req.params.animalId, 10);

    const history = await prisma.healthLog.findMany({
      where: { animal_id: animalId },
      include: {
        veterinarian: {
          select: { first_name: true, last_name: true, role: true }
        }
      },
      // Leverages your database index: @@index([animal_id, logged_at(sort: Desc)])
      orderBy: { logged_at: 'desc' } 
    });

    return res.status(200).json({
      success: true,
      count: history.length,
      history
    });
  } catch (error) {
    console.error('🔥 Fetch Medical History Error:', error);
    return res.status(500).json({ success: false, error: 'Failed to extract historical medical indexes.' });
  }
};