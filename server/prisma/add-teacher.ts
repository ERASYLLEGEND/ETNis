/// <reference types="node" />
import bcrypt from 'bcryptjs';
import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

async function main() {
  console.log('Seeding teacher user to database...\n');

  const fullName = 'Абдикаримова Наргиза Сейлбековна';
  const email = 'abdikarimova_n@ptr.nis.edu.kz';
  const password = 'Kazak2026';

  const passwordHash = await bcrypt.hash(password, 10);

  const teacher = await prisma.user.upsert({
    where: { email: email.toLowerCase().trim() },
    update: {
      fullName,
      passwordHash,
      role: 'teacher',
      isActive: true,
    },
    create: {
      fullName,
      email: email.toLowerCase().trim(),
      passwordHash,
      role: 'teacher',
      isActive: true,
    },
  });

  console.log('✅ Teacher user successfully created/updated!\n');
  console.log(`ID:         ${teacher.id}`);
  console.log(`Full Name:  ${teacher.fullName}`);
  console.log(`Email:      ${teacher.email}`);
  console.log(`Role:       ${teacher.role}`);
  console.log(`Active:     ${teacher.isActive}`);

  const isMatch = await bcrypt.compare(password, teacher.passwordHash);
  console.log(`Password verification test: ${isMatch ? '✅ PASSED' : '❌ FAILED'}\n`);

  await prisma.$disconnect();
}

main().catch(async (err: Error) => {
  console.error('\nUnexpected error:', err.message);
  await prisma.$disconnect();
  process.exit(1);
});
