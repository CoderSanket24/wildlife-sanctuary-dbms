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