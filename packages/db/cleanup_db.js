const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

async function main() {
  try {
    console.log('Cleaning up database...');
    await prisma.chat.deleteMany({});
    await prisma.room.deleteMany({});
    await prisma.user.deleteMany({});
    console.log('Cleanup successful.');
  } catch (e) {
    console.error('Cleanup failed:', e);
  } finally {
    await prisma.$disconnect();
  }
}

main();
