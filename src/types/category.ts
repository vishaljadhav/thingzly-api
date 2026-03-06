import { z } from 'zod';

export const CategorySchema = z.object({
  id: z.string(),
  name: z.string(),
  slug: z.string(),
  description: z.string().nullable().optional(),
  parentId: z.string().nullable().optional(),
  createdAt: z.string(),
});

export type Category = z.infer<typeof CategorySchema>;
