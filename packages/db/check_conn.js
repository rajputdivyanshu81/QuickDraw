const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient({
  log: ['query', 'info', 'warn', 'error'],
});

async function check() {
  console.log('Connecting to database...');
  try {
    const start = Date.now();
    const userCount = await prisma.user.count();
    console.log(`Connection successful! User count: ${userCount}`);
    console.log(`Time taken: ${Date.now() - start}ms`);
  } catch (e) {
    console.error('Connection failed.');
    console.error('Error Name:', e.name);
    console.error('Error Message:', e.message);
    if (e.code) console.error('Error Code:', e.code);
  } finally {
    await prisma.$disconnect();
  }
}

check();
