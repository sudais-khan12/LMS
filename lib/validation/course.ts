import { z } from 'zod';

export const createCourseSchema = z.object({
  title: z.string().min(2),
  code: z.string().min(2),
  description: z.string().optional(),
  teacherId: z.string().optional(),
});

export const updateCourseSchema = z.object({
  title: z.string().min(2).optional(),
  code: z.string().min(2).optional(),
  description: z.string().optional(),
  teacherId: z.string().nullable().optional(),
});


