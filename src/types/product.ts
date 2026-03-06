import { z } from 'zod';

export const ProductSlugParamsSchema = z.object({
  slug: z.string().min(1, 'Slug is required'),
});

export type ProductSlugParams = z.infer<typeof ProductSlugParamsSchema>;
