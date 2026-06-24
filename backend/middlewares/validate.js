import { z } from 'zod';

export const registerSchema = z.object({
  body: z.object({
    email: z.string().email({ message: "Invalid email format structure." }).trim().toLowerCase(),
    password: z.string().min(8, { message: "Password security boundary requires at least 8 characters." }),
    first_name: z.string().min(1, { message: "First name parameter is mandatory." }).trim(),
    last_name: z.string().min(1, { message: "Last name parameter is mandatory." }).trim(),
    age: z.number().int().min(1, { message: "Age must be a valid positive integer." }),
  }),
});

export const loginSchema = z.object({
  body: z.object({
    email: z.string().email({ message: "Invalid email structure format." }).trim().toLowerCase(),
    password: z.string().min(1, { message: "Password authentication token cannot be blank." }),
  }),
});

export const enclosureSchema = z.object({
  body: z.object({
    zone_id: z.number().int().positive({ message: "Valid target Zone ID connection link is mandatory." }),
    code_name: z.string().min(1, { message: "Unique code name identifier string is required." }).trim(),
    max_capacity: z.number().int().positive({ message: "Max capacity threshold must be a positive integer." }),
  }),
});

export const animalSchema = z.object({
  body: z.object({
    enclosure_id: z.number().int().positive({ message: "Valid target Enclosure ID link is required." }),
    species: z.string().min(1, { message: "Species classification string cannot be blank." }).trim(),
    scientific_name: z.string().min(1, { message: "Scientific taxonomic name is required." }).trim(),
    nickname: z.string().optional(),
    birth_date: z.string().datetime({ message: "Birth date must be a valid ISO datetime string." }).optional(),
    health_status: z.enum(['HEALTHY', 'UNDER_CARE', 'CRITICAL', 'QUARANTINED']).default('HEALTHY'),
  }),
});

export const surveyLogSchema = z.object({
  body: z.object({
    animal_id: z.number().int().positive({ message: "Valid Animal ID link is required." }),
    sighting_count: z.number().int().positive().default(1),
    latitude: z.number().min(-90).max(90, { message: "Latitude must stay between -90 and 90." }),
    longitude: z.number().min(-180).max(180, { message: "Longitude must stay between -180 and 180." }),
  }),
});

export const healthLogSchema = z.object({
  body: z.object({
    animal_id: z.number().int().positive({ message: "Valid Animal ID link is mandatory." }),
    veterinarian_id: z.number().int().positive({ message: "Valid Veterinarian Staff ID is required." }),
    diagnosis: z.string().min(3, { message: "Diagnosis description cannot be blank." }).trim(),
    treatment: z.string().min(3, { message: "Treatment details are required." }).trim(),
    require_isolation: z.boolean().default(false),
  }),
});

export const validate = (schema) => (req, res, next) => {
  try {
    schema.parse({
      body: req.body,
      query: req.query,
      params: req.params,
    });
    return next(); 
  } catch (error) {
    return res.status(400).json({ 
      success: false, 
      errors: error.errors.map(err => ({ field: err.path[1], message: err.message })) 
    });
  }
};