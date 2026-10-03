import bcrypt from 'bcryptjs';
import { PrismaClient } from '@prisma/client';
import jwt from 'jsonwebtoken';
import dotenv from 'dotenv';

dotenv.config();

const prisma = new PrismaClient();

async function main() {
  console.log('Testing login process...\n');

  const email = 'abdikarimova_n@ptr.nis.edu.kz';
  const password = 'Kazak2026';

  // Check environment variables
  console.log('Environment variables check:');
  console.log(`JWT_SECRET: ${process.env.JWT_SECRET ? '✅ Set' : '❌ NOT SET'}`);
  console.log(`DATABASE_URL: ${process.env.DATABASE_URL ? '✅ Set' : '❌ NOT SET'}`);
  console.log(`PORT: ${process.env.PORT || '❌ NOT SET'}`);
  console.log(`CLIENT_URL: ${process.env.CLIENT_URL || '❌ NOT SET'}\n`);

  // Find user
  console.log('Step 1: Finding user...');
  const user = await prisma.user.findUnique({
    where: { email: email.toLowerCase().trim() },
  });

  if (!user) {
    console.error('❌ User not found');
    await prisma.$disconnect();
    process.exit(1);
  }

  console.log('✅ User found:', user.fullName);
  console.log(`   Active: ${user.isActive}\n`);

  // Check password
  console.log('Step 2: Verifying password...');
  const isMatch = await bcrypt.compare(password, user.passwordHash);
  console.log(`   Password match: ${isMatch ? '✅ PASSED' : '❌ FAILED'}\n`);

  if (!isMatch) {
    await prisma.$disconnect();
    process.exit(1);
  }

  // Try to sign token
  console.log('Step 3: Signing JWT token...');
  try {
    const JWT_SECRET = process.env.JWT_SECRET;
    if (!JWT_SECRET) {
      console.error('❌ JWT_SECRET is not set in environment variables');
      await prisma.$disconnect();
      process.exit(1);
    }

    const token = jwt.sign(
      {
        userId: user.id,
        role: user.role,
        email: user.email,
        fullName: user.fullName,
        teacherId: user.teacherId,
      },
      JWT_SECRET,
      { expiresIn: '7d' }
    );

    console.log('✅ Token signed successfully');
    console.log(`   Token length: ${token.length} characters\n`);

    // Verify token
    console.log('Step 4: Verifying token...');
    const decoded = jwt.verify(token, JWT_SECRET) as any;
    console.log('✅ Token verified successfully');
    console.log(`   Decoded userId: ${decoded.userId}\n`);

    console.log('🎉 Login process completed successfully!');
    console.log('The user should be able to login without errors.');

  } catch (error: any) {
    console.error('❌ Error during token signing/verification:', error.message);
    console.error('Full error:', error);
  }

  await prisma.$disconnect();
}

main().catch(async (err: Error) => {
  console.error('\nUnexpected error:', err.message);
  await prisma.$disconnect();
  process.exit(1);
});
