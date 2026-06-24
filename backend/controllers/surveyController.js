import prisma from '../config/prisma.js'

export const logFaunaSurvey = async (req, res) => {
  try {
    const { animal_id, sighting_count, latitude, longitude } = req.body;

    // Verify that the animal actually exists before logging a survey against it
    const animalExists = await prisma.animal.findUnique({
      where: { animal_id }
    });

    if (!animalExists) {
      return res.status(404).json({ success: false, error: 'Data Mismatch: Target animal specimen ID does not exist.' });
    }

    // Commit coordinate log to database disk
    const newSurvey = await prisma.survey.create({
      data: {
        animal_id,
        sighting_count, 
        latitude,
        longitude
      }
    });

    return res.status(201).json({
      success: true,
      message: 'Telemetry camera trap field data recorded successfully.',
      survey: newSurvey
    });
  } catch (error) {
    console.error('🔥 Field Survey Log Aborted:', error);
    return res.status(500).json({ success: false, error: 'Failed to commit coordinate log to database disk.' });
  }
};