/// <reference types="node" />
import * as readline from 'readline';
import bcrypt from 'bcryptjs';
import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

const rl = readline.createInterface({
  input: process.stdin,
  output: process.stdout,
});

function ask(question: string): Promise<string> {
  return new Promise((resolve) => {
    rl.question(question, (answer: string) => {
      resolve(answer.trim());
    });
  });
}

async function main() {
  console.log('\n=== Жаңа мұғалім аккаунтын жасау / Создание аккаунта учителя ===\n');

  const fullName = await ask('ФИО (Толық аты-жөні): ');
  if (!fullName) {
    console.error('Қате: ФИО бос болмауы керек.');
    process.exit(1);
  }

  const emailRaw = await ask('Email: ');
  const email = emailRaw.toLowerCase().trim();
  if (!email || !email.includes('@')) {
    console.error('Қате: Жарамды email енгізіңіз.');
    process.exit(1);
  }

  const password = await ask('Құпиясөз (Password): ');
  if (!password || password.length < 6) {
    console.error('Қате: Құпиясөз кем дегенде 6 таңбадан тұруы керек.');
    process.exit(1);
  }

  rl.close();

  // Check if email already exists
  const existing = await prisma.user.findUnique({ where: { email } });
  if (existing) {
    console.error(`\nҚате: "${email}" email-і бар пайдаланушы жүйеде бар.`);
    await prisma.$disconnect();
    process.exit(1);
  }

  // Hash password with the same salt rounds used throughout the app
  const passwordHash = await bcrypt.hash(password, 10);

  const teacher = await prisma.user.create({
    data: {
      fullName,
      email,
      passwordHash,
      role: 'teacher',
    },
  });

  console.log(`\n✅ Мұғалім аккаунты сәтті жасалды!`);
  console.log(`   ID:    ${teacher.id}`);
  console.log(`   ФИО:   ${teacher.fullName}`);
  console.log(`   Email: ${teacher.email}`);
  console.log(`   Роль:  ${teacher.role}\n`);

  await prisma.$disconnect();
}

main().catch(async (err: Error) => {
  console.error('\nКүтпеген қате / Неожиданная ошибка:', err.message);
  await prisma.$disconnect();
  process.exit(1);
});
