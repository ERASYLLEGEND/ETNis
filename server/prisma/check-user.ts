import bcrypt from 'bcryptjs';
import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

async function main() {
  console.log('Checking user in database...\n');

  const email = 'abdikarimova_n@ptr.nis.edu.kz';
  const password = 'Kazak2026';

  // Find user
  const user = await prisma.user.findUnique({
    where: { email: email.toLowerCase().trim() },
  });

  if (!user) {
    console.error('❌ User not found in database');
    await prisma.$disconnect();
    process.exit(1);
  }

  console.log('✅ User found:');
  console.log(`ID:           ${user.id}`);
  console.log(`Full Name:    ${user.fullName}`);
  console.log(`Email:        ${user.email}`);
  console.log(`Role:         ${user.role}`);
  console.log(`Active:       ${user.isActive}`);
  console.log(`Password Hash: ${user.passwordHash.substring(0, 20)}...`);

  // Test password verification
  console.log('\nTesting password verification...');
  const isMatch = await bcrypt.compare(password, user.passwordHash);
  console.log(`Password match: ${isMatch ? '✅ PASSED' : '❌ FAILED'}`);

  if (!isMatch) {
    console.error('\n❌ Password verification failed!');
    console.error('This means the hash was created incorrectly or bcrypt salt rounds differ.');
  }

  await prisma.$disconnect();
}

main().catch(async (err: Error) => {
  console.error('\nError:', err.message);
  await prisma.$disconnect();
  process.exit(1);
});
