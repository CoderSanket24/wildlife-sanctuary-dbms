import prisma from '../config/prisma.js';

async function seedSurveys() {
  console.log('📍 Checking Sanctuary GPS Survey Sightings...');
  
  const count = await prisma.survey.count();
  console.log(`Current survey count: ${count}`);

  const animals = await prisma.animal.findMany({
    include: {
      enclosure: {
        include: {
          zone: true
        }
      }
    }
  });

  console.log(`Found ${animals.length} animals in sanctuary database.`);

  const zoneCoordinates = {
    'Savannah & Open Grasslands':       [11.6520, 76.6340],
    'Western Ghats Dense Rainforest':   [11.6780, 76.6080],
    'Himalayan High Altitude Reserve':  [11.6950, 76.5920],
    'Sundarbans Mangrove Wetland':      [11.6880, 76.6480],
    'Thar Desert Arid Enclave':         [11.6420, 76.6550],
    'Nilgiri Shola Forest':             [11.6320, 76.6110]
  };

  const defaultCenter = [11.6681, 76.6200];

  let added = 0;
  for (const animal of animals) {
    const existing = await prisma.survey.count({ where: { animal_id: animal.animal_id } });
    if (existing >= 2) continue; // Already has sightings

    const zoneName = animal.enclosure?.zone?.name;
    const baseCoords = zoneCoordinates[zoneName] || defaultCenter;

    // Create 2 realistic sightings clustered in their habitat zone
    for (let i = 0; i < 2; i++) {
      const latOffset = (Math.random() - 0.5) * 0.009;
      const lngOffset = (Math.random() - 0.5) * 0.009;
      const daysAgo = Math.floor(Math.random() * 12) + 1;
      const surveyDate = new Date(Date.now() - daysAgo * 24 * 60 * 60 * 1000);

      await prisma.survey.create({
        data: {
          animal_id: animal.animal_id,
          sighting_count: Math.floor(Math.random() * 3) + 1,
          latitude: +(baseCoords[0] + latOffset).toFixed(6),
          longitude: +(baseCoords[1] + lngOffset).toFixed(6),
          survey_date: surveyDate
        }
      });
      added++;
    }
  }

  console.log(`✅ Seeded ${added} new high-precision GPS telemetry sightings.`);
  await prisma.$disconnect();
}

seedSurveys().catch((err) => {
  console.error('Error seeding surveys:', err);
  process.exit(1);
});
