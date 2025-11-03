import { z } from 'zod';

export const roleEnum = z.enum(['ADMIN', 'TEACHER', 'STUDENT']);

export const createUserSchema = z.object({
  name: z.string().min(2),
  email: z.string().email(),
  password: z.string().min(6),
  role: roleEnum,
  specialization: z.string().optional(),
  contact: z.string().optional(),
  enrollmentNo: z.string().optional(),
  semester: z.number().int().optional(),
  section: z.string().optional(),
});

export const updateUserSchema = z.object({
  name: z.string().min(2).optional(),
  email: z.string().email().optional(),
  password: z.string().min(6).optional(),
  role: roleEnum.optional(),
  specialization: z.string().optional(),
  contact: z.string().optional(),
  enrollmentNo: z.string().optional(),
  semester: z.number().int().optional(),
  section: z.string().optional(),
});


