import { prisma } from '../lib/prisma.js';

export class CategoryService {
  async findAll() {
    return prisma.category.findMany({
      orderBy: { name: 'asc' },
    });
  }
}
