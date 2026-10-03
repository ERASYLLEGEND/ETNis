import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

async function main() {
  console.log('Listing all users in database...\n');

  const users = await prisma.user.findMany({
    select: {
      id: true,
      fullName: true,
      email: true,
      role: true,
      isActive: true,
      createdAt: true,
    },
  });

  console.log(`Total users: ${users.length}\n`);

  users.forEach((user, index) => {
    console.log(`${index + 1}. ${user.fullName}`);
    console.log(`   Email: ${user.email}`);
    console.log(`   Role: ${user.role}`);
    console.log(`   Active: ${user.isActive}`);
    console.log(`   ID: ${user.id}`);
    console.log(`   Created: ${user.createdAt.toISOString()}\n`);
  });

  await prisma.$disconnect();
}

main().catch(async (err: Error) => {
  console.error('\nError:', err.message);
  await prisma.$disconnect();
  process.exit(1);
});
