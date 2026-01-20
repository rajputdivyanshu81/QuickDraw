const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

async function main() {
  const chatCount = await prisma.chat.count();
  const chats = await prisma.chat.findMany({
    take: 5,
    orderBy: { id: 'desc' }
  });
  console.log('Total shapes in DB:', chatCount);
  console.log('Recent shapes:', JSON.stringify(chats, null, 2));
}

main()
  .catch(e => console.error(e))
  .finally(async () => await prisma.$disconnect());
