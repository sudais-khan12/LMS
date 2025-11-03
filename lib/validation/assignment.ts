import { z } from 'zod';

export const createAssignmentSchema = z.object({
  title: z.string().min(2),
  description: z.string().optional(),
  dueDate: z.string().refine((v) => !isNaN(Date.parse(v)), 'Invalid date'),
  courseId: z.string(),
});

export const updateAssignmentSchema = z.object({
  title: z.string().min(2).optional(),
  description: z.string().optional(),
  dueDate: z.string().refine((v) => !isNaN(Date.parse(v)), 'Invalid date').optional(),
});


