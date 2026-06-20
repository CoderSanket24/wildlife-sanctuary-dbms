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