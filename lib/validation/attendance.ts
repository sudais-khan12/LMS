import { z } from 'zod';

export const upsertAttendanceSchema = z.object({
  studentId: z.string(),
  courseId: z.string(),
  date: z.string().optional(), // ISO date; defaults to today
  status: z.enum(['PRESENT', 'ABSENT', 'LATE']),
});


