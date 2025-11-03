import { z } from 'zod';

export const gradeSubmissionSchema = z.object({
  grade: z.number().min(0).max(100).optional(),
});

export const createSubmissionSchema = z.object({
  assignmentId: z.string(),
  fileUrl: z.string().url().optional(),
  content: z.string().min(1).optional(),
});

export const updateSubmissionSchema = z.object({
  fileUrl: z.string().url().optional(),
  content: z.string().min(1).optional(),
});

