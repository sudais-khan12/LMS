import { z } from 'zod';

export const updateLeaveStatusSchema = z.object({
  status: z.enum(['PENDING', 'APPROVED', 'REJECTED']),
  remarks: z.string().optional(),
});

export const createLeaveSchema = z.object({
  type: z.string().min(2),
  fromDate: z.string().refine((val) => !isNaN(Date.parse(val)), 'Invalid from date'),
  toDate: z.string().refine((val) => !isNaN(Date.parse(val)), 'Invalid to date'),
  reason: z.string().min(10),
}).refine((data) => new Date(data.fromDate) <= new Date(data.toDate), {
  message: 'From date must be before or equal to to date',
  path: ['toDate'],
});


