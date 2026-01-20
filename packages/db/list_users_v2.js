const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

async function main() {
  try {
    const users = await prisma.user.findMany();
    console.log(`Total users: ${users.length}`);
    for (const u of users) {
      console.log(`ID: [${u.id}] | Email: [${u.email}] | Name: [${u.name}]`);
    }
  } catch (e) {
    console.error(e);
  } finally {
    await prisma.$disconnect();
  }
}

main();
