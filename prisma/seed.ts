import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

async function main(): Promise<void> {
  console.info('Seeding database...');

  // Create simple categories deign, productivity, courses
  const categories = await Promise.all([
    prisma.category.upsert({
      where: { slug: 'design' },
      update: {},
      create: {
        name: 'Design',
        slug: 'design',
      },
    }),
    prisma.category.upsert({
      where: { slug: 'productivity' },
      update: {},
      create: {
        name: 'Productivity',
        slug: 'productivity',
      },
    }),
    prisma.category.upsert({
      where: { slug: 'courses' },
      update: {},
      create: {
        name: 'Courses',
        slug: 'courses',
      },
    }),
    prisma.category.upsert({
      where: { slug: '3d-printing' },
      update: {},
      create: {
        name: '3D Printing',
        slug: '3d-printing',
      },
    }),
    prisma.category.upsert({
      where: { slug: 'ui-kits' },
      update: {},
      create: {
        name: 'UI Kits',
        slug: 'ui-kits',
      },
    }),
    prisma.category.upsert({
      where: { slug: 'photography' },
      update: {},
      create: {
        name: 'Photography',
        slug: 'photography',
      },
    }),
    prisma.category.upsert({
      where: { slug: 'video' },
      update: {},
      create: {
        name: 'Video',
        slug: 'video',
      },
    }),
    prisma.category.upsert({
      where: { slug: 'audio' },
      update: {},
      create: {
        name: 'Audio',
        slug: 'audio',
      },
    }),
    prisma.category.upsert({
      where: { slug: 'marketing' },
      update: {},
      create: {
        name: 'Marketing',
        slug: 'marketing',
      },
    }),
    prisma.category.upsert({
      where: { slug: 'development' },
      update: {},
      create: {
        name: 'Development',
        slug: 'development',
      },
    }),
    prisma.category.upsert({
      where: { slug: 'business' },
      update: {},
      create: {
        name: 'Business',
        slug: 'business',
      },
    }),
  ]);

  console.info(`Created ${categories.length} categories`);
  console.info('Seeding completed!');
}

main()
  .catch((e) => {
    console.error('Error seeding database:', e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
