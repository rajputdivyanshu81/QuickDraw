import { WebSocketServer, WebSocket } from 'ws';
import { prismaClient } from '@repo/db/client';
import { verifyToken } from '@clerk/backend';

const wss = new WebSocketServer({ port: 8080 });

console.log("WebSocket Server starting...");
console.log("CLERK_SECRET_KEY present:", !!process.env.CLERK_SECRET_KEY);
console.log("DATABASE_URL present:", !!process.env.DATABASE_URL);

interface User {
  ws: WebSocket,
  rooms: string[],
  userId: string
}

const users: User[] = [];

async function checkUser(token: string): Promise<{ userId: string, email: string, name: string } | null> {
  try {
    const decoded = await verifyToken(token, {
      secretKey: process.env.CLERK_SECRET_KEY,
    });
    return {
      userId: decoded.sub,
      email: (decoded as any).email || (decoded as any).email_address || `${decoded.sub}@clerk.com`,
      name: (decoded as any).name || (decoded as any).first_name || "User"
    };
  } catch (e) {
    return null;
  }
}

wss.on('connection', async function connection(ws, request) {
  const url = request.url;
  if (!url) {
    return;
  }
  const queryParams = new URLSearchParams(url.split('?')[1]);
  const token = queryParams.get('token') || "";
  // 1. Immediately register the message handler so we don't lose the initial 'join_room' message
  const messageQueue: any[] = [];
  let isReady = false;

  ws.on('message', async function (data) {
    if (!isReady) {
      messageQueue.push(data);
      return;
    }
    handleMessage(data);
  });

  // 2. Perform authentication and sync in background
  const userData = await checkUser(token);
  if (userData == null) {
    ws.close();
    return;
  }

  const userId = userData.userId;

  try {
    await prismaClient.user.upsert({
      where: { id: userId },
      update: {
        email: userData.email,
        name: userData.name
      },
      create: {
        id: userId,
        email: userData.email,
        name: userData.name,
        password: ""
      }
    });

    users.push({
      userId,
      rooms: [],
      ws
    });

    // 3. Process queued messages
    isReady = true;
    while (messageQueue.length > 0) {
      const data = messageQueue.shift();
      handleMessage(data);
    }
  } catch (error) {
    console.error("Failed to sync user to local DB:", error);
    ws.close();
    return;
  }

  async function handleMessage(data: any) {
    let parsedData;
    try {
      if (typeof data !== "string") {
        parsedData = JSON.parse(data.toString());
      } else {
        parsedData = JSON.parse(data);
      }
    } catch (e) {
      return;
    }

    async function resolveRoomId(idOrSlug: string, autoCreate = false): Promise<number | null> {
      const id = Number(idOrSlug);
      if (!isNaN(id)) {
        const room = await prismaClient.room.findUnique({ where: { id } });
        if (room) return room.id;

        if (autoCreate) {
          try {
            const newRoom = await prismaClient.room.create({
              data: {
                id,
                slug: `${id}-${Math.random().toString(36).substring(2, 6)}`,
                adminId: userId
              }
            });
            return newRoom.id;
          } catch (e) {
            // Might have been created by another parallel request
            const retry = await prismaClient.room.findUnique({ where: { id } });
            return retry ? retry.id : null;
          }
        }
        return null;
      }

      const room = await prismaClient.room.findFirst({
        where: { slug: idOrSlug }
      });
      if (room) return room.id;

      if (autoCreate) {
        try {
          const newRoom = await prismaClient.room.create({
            data: {
              slug: idOrSlug,
              adminId: userId
            }
          });
          return newRoom.id;
        } catch (e) {
          const retry = await prismaClient.room.findFirst({ where: { slug: idOrSlug } });
          return retry ? retry.id : null;
        }
      }
      return null;
    }

    /** Moved to handleMessage helper **/

    if (parsedData.type === "join_room") {
      const user = users.find(x => x.ws === ws);
      const roomIdToJoin = parsedData.roomId.toString();
      console.log(`User ${user?.userId} joining room: ${roomIdToJoin}`);
      if (user && !user.rooms.includes(roomIdToJoin)) {
        user.rooms.push(roomIdToJoin);
        // Ensure room exists
        await resolveRoomId(roomIdToJoin, true);
      }
    }

    if (parsedData.type === "leave_room") {
      const user = users.find(x => x.ws === ws);
      if (user) {
        user.rooms = user.rooms.filter(x => x !== parsedData.roomId);
      }
    }

    console.log("message received", parsedData.type);

    if (parsedData.type === "chat") {
      const roomIdStr = parsedData.roomId;
      const message = parsedData.message;
      const roomId = await resolveRoomId(roomIdStr, true);

      console.log(`Received chat for room: ${roomIdStr} (ID: ${roomId})`);

      if (roomId) {
        try {
          await prismaClient.chat.create({
            data: {
              roomId,
              message,
              userId
            }
          });
          console.log(`Saved chat to DB for room ID: ${roomId}`);

          console.log(`Broadcasting to ${users.length} users...`);
          users.forEach(user => {
            console.log(`User ${user.userId} rooms: ${user.rooms.join(', ')}`);
            if (user.rooms.includes(roomIdStr.toString())) {
              console.log(`Sending message to user ${user.userId}`);
              user.ws.send(JSON.stringify({
                type: "chat",
                message: message,
                roomId: roomIdStr
              }))
            }
          });
        } catch (e) {
          console.error("Chat creation failed:", e);
        }
      } else {
        console.error(`Could not resolve room ID for: ${roomIdStr}`);
      }
    }

    if (parsedData.type === "delete_shape") {
      const roomIdStr = parsedData.roomId;
      const shapeId = parsedData.shapeId;
      const roomId = await resolveRoomId(roomIdStr);

      if (roomId) {
        await prismaClient.chat.deleteMany({
          where: {
            roomId,
            message: {
              contains: `"id":"${shapeId}"`
            }
          }
        });

        users.forEach(user => {
          if (user.rooms.includes(roomIdStr.toString())) {
            user.ws.send(JSON.stringify({
              type: "delete_shape",
              shapeId,
              roomId: roomIdStr.toString()
            }))
          }
        })
      }
    }

    if (parsedData.type === "update_shape") {
      const roomIdStr = parsedData.roomId;
      const shape = parsedData.shape;
      const roomId = await resolveRoomId(roomIdStr);

      if (roomId) {
        const existingChat = await prismaClient.chat.findFirst({
          where: {
            roomId,
            message: {
              contains: `"id":"${shape.id}"`
            }
          }
        });

        if (existingChat) {
          await prismaClient.chat.update({
            where: {
              id: existingChat.id
            },
            data: {
              message: JSON.stringify({ shape })
            }
          });
        }

        users.forEach(user => {
          if (user.rooms.includes(roomIdStr.toString())) {
            user.ws.send(JSON.stringify({
              type: "update_shape",
              shape,
              roomId: roomIdStr.toString()
            }))
          }
        })
      }
    }
  }

  ws.on('close', () => {
    const index = users.findIndex(x => x.ws === ws);
    if (index !== -1) {
      users.splice(index, 1);
    }
    console.log("User disconnected");
  });

});