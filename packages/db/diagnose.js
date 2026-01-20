const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

async function test() {
  try {
    const roomId = 7585;
    console.log(`Checking Room ${roomId}...`);
    const room = await prisma.room.findFirst({
      where: {
        OR: [
          { id: roomId },
          { slug: roomId.toString() }
        ]
      }
    });

    if (!room) {
      console.log('Room not found in DB.');
    } else {
      console.log('Room found:', JSON.stringify(room, null, 2));
      const chats = await prisma.chat.findMany({
        where: { roomId: room.id },
        orderBy: { id: 'asc' }
      });
      console.log(`Found ${chats.length} chats.`);
      if (chats.length > 0) {
        console.log('Last 3 chats:', JSON.stringify(chats.slice(-3), null, 2));
      }
    }

    const allRooms = await prisma.room.count();
    const allChats = await prisma.chat.count();
    console.log(`Total Rooms in DB: ${allRooms}`);
    console.log(`Total Chats in DB: ${allChats}`);

  } catch (e) {
    console.error('Error during test:', e);
  } finally {
    await prisma.$disconnect();
  }
}

test();
