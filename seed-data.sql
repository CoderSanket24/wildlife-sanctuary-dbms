-- =============================================================================
-- WILDLIFE SANCTUARY DBMS — EXPANDED SAMPLE DATASET
-- =============================================================================

-- -----------------------------------------------------------------------------
-- 1. ZONES (6 Climate Zones)
-- -----------------------------------------------------------------------------
INSERT INTO zones (name, climate, camera_traps_count, ticket_price) VALUES
('Savannah & Open Grasslands', 'TROPICAL', 16, 250.00),
('Western Ghats Dense Rainforest', 'TROPICAL', 24, 350.00),
('Himalayan High Altitude Reserve', 'ALPINE', 18, 400.00),
('Sundarbans Mangrove Wetland', 'WETLAND', 14, 300.00),
('Thar Desert Arid Enclave', 'ARID', 10, 200.00),
('Nilgiri Shola Forest', 'TEMPERATE', 12, 280.00)
ON CONFLICT (name) DO NOTHING;

-- -----------------------------------------------------------------------------
-- 2. ENCLOSURES (12 Specialized Enclosures)
-- -----------------------------------------------------------------------------
INSERT INTO enclosures (zone_id, code_name, max_capacity, current_occupancy) VALUES
-- Savannah
((SELECT zone_id FROM zones WHERE name = 'Savannah & Open Grasslands'), 'ENC-LION-01', 6, 0),
((SELECT zone_id FROM zones WHERE name = 'Savannah & Open Grasslands'), 'ENC-ELEPH-01', 10, 0),
-- Rainforest
((SELECT zone_id FROM zones WHERE name = 'Western Ghats Dense Rainforest'), 'ENC-TIGER-01', 5, 0),
((SELECT zone_id FROM zones WHERE name = 'Western Ghats Dense Rainforest'), 'ENC-LEOPARD-01', 4, 0),
((SELECT zone_id FROM zones WHERE name = 'Western Ghats Dense Rainforest'), 'ENC-PRIMATE-01', 8, 0),
-- Himalayan
((SELECT zone_id FROM zones WHERE name = 'Himalayan High Altitude Reserve'), 'ENC-SNOWLEOP-01', 4, 0),
((SELECT zone_id FROM zones WHERE name = 'Himalayan High Altitude Reserve'), 'ENC-REDPANDA-01', 6, 0),
-- Wetlands
((SELECT zone_id FROM zones WHERE name = 'Sundarbans Mangrove Wetland'), 'ENC-RHINO-01', 6, 0),
((SELECT zone_id FROM zones WHERE name = 'Sundarbans Mangrove Wetland'), 'ENC-CROCODILE-01', 12, 0),
-- Thar Desert
((SELECT zone_id FROM zones WHERE name = 'Thar Desert Arid Enclave'), 'ENC-BLACKBUCK-01', 15, 0),
((SELECT zone_id FROM zones WHERE name = 'Thar Desert Arid Enclave'), 'ENC-REPTILE-01', 10, 0),
-- Nilgiri Shola
((SELECT zone_id FROM zones WHERE name = 'Nilgiri Shola Forest'), 'ENC-NILGIRITAHR-01', 8, 0)
ON CONFLICT (code_name) DO NOTHING;

-- -----------------------------------------------------------------------------
-- 3. ANIMALS (25 Detailed Species Records)
-- -----------------------------------------------------------------------------
INSERT INTO animals (enclosure_id, species, scientific_name, nickname, birth_date, date_joined, health_status) VALUES
-- Tigers & Lions
((SELECT enclosure_id FROM enclosures WHERE code_name = 'ENC-TIGER-01'), 'Bengal Tiger', 'Panthera tigris tigris', 'Shera', '2019-04-12', '2021-06-15', 'HEALTHY'),
((SELECT enclosure_id FROM enclosures WHERE code_name = 'ENC-TIGER-01'), 'Bengal Tiger', 'Panthera tigris tigris', 'Baghira', '2020-10-08', '2022-03-14', 'HEALTHY'),
((SELECT enclosure_id FROM enclosures WHERE code_name = 'ENC-LION-01'), 'Asiatic Lion', 'Panthera leo persica', 'Simba', '2018-01-20', '2020-05-10', 'HEALTHY'),
((SELECT enclosure_id FROM enclosures WHERE code_name = 'ENC-LION-01'), 'Asiatic Lion', 'Panthera leo persica', 'Nala', '2019-07-15', '2020-05-10', 'UNDER_CARE'),

-- Elephants
((SELECT enclosure_id FROM enclosures WHERE code_name = 'ENC-ELEPH-01'), 'Indian Elephant', 'Elephas maximus indicus', 'Gaja', '2012-08-20', '2016-02-10', 'HEALTHY'),
((SELECT enclosure_id FROM enclosures WHERE code_name = 'ENC-ELEPH-01'), 'Indian Elephant', 'Elephas maximus indicus', 'Airavat', '2015-11-03', '2019-04-22', 'HEALTHY'),
((SELECT enclosure_id FROM enclosures WHERE code_name = 'ENC-ELEPH-01'), 'Indian Elephant', 'Elephas maximus indicus', 'Anandi', '2021-03-18', '2021-03-18', 'HEALTHY'),

-- Leopards & High Altitude
((SELECT enclosure_id FROM enclosures WHERE code_name = 'ENC-LEOPARD-01'), 'Indian Leopard', 'Panthera pardus fusca', 'Shadow', '2020-02-14', '2021-11-05', 'HEALTHY'),
((SELECT enclosure_id FROM enclosures WHERE code_name = 'ENC-SNOWLEOP-01'), 'Snow Leopard', 'Panthera uncia', 'Chiku', '2021-05-19', '2022-10-01', 'UNDER_CARE'),
((SELECT enclosure_id FROM enclosures WHERE code_name = 'ENC-SNOWLEOP-01'), 'Snow Leopard', 'Panthera uncia', 'Kailash', '2019-12-01', '2021-08-19', 'HEALTHY'),

-- Red Panda & Primates
((SELECT enclosure_id FROM enclosures WHERE code_name = 'ENC-REDPANDA-01'), 'Red Panda', 'Ailurus fulgens', 'Mishu', '2022-06-19', '2023-01-10', 'HEALTHY'),
((SELECT enclosure_id FROM enclosures WHERE code_name = 'ENC-REDPANDA-01'), 'Red Panda', 'Ailurus fulgens', 'Rusty', '2022-08-04', '2023-01-10', 'CRITICAL'),
((SELECT enclosure_id FROM enclosures WHERE code_name = 'ENC-PRIMATE-01'), 'Lion-tailed Macaque', 'Macaca silenus', 'Manu', '2017-09-12', '2019-10-15', 'HEALTHY'),
((SELECT enclosure_id FROM enclosures WHERE code_name = 'ENC-PRIMATE-01'), 'Lion-tailed Macaque', 'Macaca silenus', 'Mimi', '2018-04-25', '2019-10-15', 'HEALTHY'),

-- Rhinos & Crocodiles
((SELECT enclosure_id FROM enclosures WHERE code_name = 'ENC-RHINO-01'), 'One-Horned Rhinoceros', 'Rhinoceros unicornis', 'Vikram', '2016-09-05', '2019-07-18', 'HEALTHY'),
((SELECT enclosure_id FROM enclosures WHERE code_name = 'ENC-RHINO-01'), 'One-Horned Rhinoceros', 'Rhinoceros unicornis', 'Gauri', '2018-12-14', '2021-01-08', 'HEALTHY'),
((SELECT enclosure_id FROM enclosures WHERE code_name = 'ENC-CROCODILE-01'), 'Saltwater Crocodile', 'Crocodylus porosus', 'Jaws', '2010-05-11', '2015-06-01', 'HEALTHY'),
((SELECT enclosure_id FROM enclosures WHERE code_name = 'ENC-CROCODILE-01'), 'Mugger Crocodile', 'Crocodylus palustris', 'Snap', '2014-08-20', '2017-09-12', 'HEALTHY'),

-- Blackbucks & Reptiles
((SELECT enclosure_id FROM enclosures WHERE code_name = 'ENC-BLACKBUCK-01'), 'Blackbuck', 'Antilope cervicapra', 'Karna', '2021-01-15', '2022-02-10', 'HEALTHY'),
((SELECT enclosure_id FROM enclosures WHERE code_name = 'ENC-BLACKBUCK-01'), 'Blackbuck', 'Antilope cervicapra', 'Arjun', '2021-03-22', '2022-02-10', 'HEALTHY'),
((SELECT enclosure_id FROM enclosures WHERE code_name = 'ENC-BLACKBUCK-01'), 'Indian Gazelle (Chinkara)', 'Gazella bennettii', 'Pawan', '2022-02-11', '2023-01-05', 'HEALTHY'),
((SELECT enclosure_id FROM enclosures WHERE code_name = 'ENC-REPTILE-01'), 'King Cobra', 'Ophiophagus hannah', 'Naga', '2021-10-30', '2022-11-20', 'QUARANTINED'),
((SELECT enclosure_id FROM enclosures WHERE code_name = 'ENC-REPTILE-01'), 'Indian Rock Python', 'Python molurus', 'Nagini', '2019-06-18', '2021-04-12', 'HEALTHY'),

-- Nilgiri Tahr
((SELECT enclosure_id FROM enclosures WHERE code_name = 'ENC-NILGIRITAHR-01'), 'Nilgiri Tahr', 'Nilgiritragus hylocrius', 'Mountain King', '2020-04-05', '2021-09-30', 'HEALTHY'),
((SELECT enclosure_id FROM enclosures WHERE code_name = 'ENC-NILGIRITAHR-01'), 'Nilgiri Tahr', 'Nilgiritragus hylocrius', 'Flora', '2021-08-12', '2022-05-18', 'HEALTHY');

-- -----------------------------------------------------------------------------
-- 5. ANIMAL SURVEYS (Field Sighting Logs with GPS Coordinates)
-- -----------------------------------------------------------------------------
INSERT INTO animal_surveys (animal_id, survey_date, sighting_count, latitude, longitude) VALUES
((SELECT animal_id FROM animals WHERE nickname = 'Shera'), NOW() - INTERVAL '2 days', 1, 11.668100, 76.619200),
((SELECT animal_id FROM animals WHERE nickname = 'Gaja'), NOW() - INTERVAL '4 days', 3, 11.672400, 76.623100),
((SELECT animal_id FROM animals WHERE nickname = 'Chiku'), NOW() - INTERVAL '10 days', 1, 31.104800, 77.173400),
((SELECT animal_id FROM animals WHERE nickname = 'Vikram'), NOW() - INTERVAL '1 day', 2, 26.144500, 91.736200),
((SELECT animal_id FROM animals WHERE nickname = 'Karna'), NOW() - INTERVAL '6 days', 8, 26.912400, 70.902300),
((SELECT animal_id FROM animals WHERE nickname = 'Simba'), NOW() - INTERVAL '3 days', 2, 21.124300, 70.824100);


-- 1. Create Visitor accounts for Vets
INSERT INTO visitors (email, password_hash, first_name, last_name, age, role) VALUES
('dr.priya@wildlife.gov.in', '$argon2id$v=19$m=65536,t=3,p=4$dummyhashforvet1', 'Dr. Priya', 'Sharma', 38, 'STAFF'),
('dr.rajesh@wildlife.gov.in', '$argon2id$v=19$m=65536,t=3,p=4$dummyhashforvet2', 'Dr. Rajesh', 'Verma', 45, 'STAFF')
ON CONFLICT (email) DO NOTHING;

-- 2. Set their staff role to 'VETERINARIAN'
UPDATE staff
SET role = 'VETERINARIAN'
WHERE email IN ('dr.priya@wildlife.gov.in', 'dr.rajesh@wildlife.gov.in');

-- health logs
INSERT INTO health_logs (animal_id, veterinarian_id, logged_at, diagnosis, treatment, require_isolation) VALUES
-- Examined by Dr. Priya Sharma
((SELECT animal_id FROM animals WHERE nickname = 'Chiku'),
 (SELECT staff_id FROM staff WHERE role = 'VETERINARIAN' AND email = 'dr.priya@wildlife.gov.in'),
 NOW() - INTERVAL '3 days',
 'High altitude respiratory infection',
 'Administered broad-spectrum antibiotics and oxygen therapy.',
 TRUE),

-- Examined by Dr. Rajesh Verma
((SELECT animal_id FROM animals WHERE nickname = 'Rusty'),
 (SELECT staff_id FROM staff WHERE role = 'VETERINARIAN' AND email = 'dr.rajesh@wildlife.gov.in'),
 NOW() - INTERVAL '1 day',
 'Severe gastrointestinal distress and dehydration',
 'IV fluids, probiotics, and dietary restriction.',
 TRUE),

-- Examined by Dr. Priya Sharma
((SELECT animal_id FROM animals WHERE nickname = 'Nala'),
 (SELECT staff_id FROM staff WHERE role = 'VETERINARIAN' AND email = 'dr.priya@wildlife.gov.in'),
 NOW() - INTERVAL '5 days',
 'Minor paw laceration during territorial movement',
 'Cleaned wound with antiseptic solution, topical ointment applied.',
 FALSE),

-- Examined by Dr. Rajesh Verma
((SELECT animal_id FROM animals WHERE nickname = 'Naga'),
 (SELECT staff_id FROM staff WHERE role = 'VETERINARIAN' AND email = 'dr.rajesh@wildlife.gov.in'),
 NOW() - INTERVAL '7 days',
 'Ecdysis (shedding cycle) monitoring and slight lethargy',
 'Quarantined in controlled humidity terrarium.',
 TRUE),

-- Examined by Dr. Priya Sharma
((SELECT animal_id FROM animals WHERE nickname = 'Baghira'),
 (SELECT staff_id FROM staff WHERE role = 'VETERINARIAN' AND email = 'dr.priya@wildlife.gov.in'),
 NOW() - INTERVAL '14 days',
 'Annual dental examination and scaling',
 'Tartar removal under mild anesthesia.',
 FALSE);