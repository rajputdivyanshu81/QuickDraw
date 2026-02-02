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
  userId: string,
  name: string
}

const users: User[] = [];

async function checkUser(token: string): Promise<{ userId: string, email: string, name: string } | null> {
  const secretKey = process.env.CLERK_SECRET_KEY;
  if (!secretKey) {
    console.error("CRITICAL: CLERK_SECRET_KEY is missing in backend env!");
  }

  try {
    const decoded = await verifyToken(token, {
      secretKey: secretKey,
    });
    return {
      userId: decoded.sub,
      email: (decoded as any).email || (decoded as any).email_address || `${decoded.sub}@clerk.com`,
      name: (decoded as any).name || (decoded as any).first_name || "User"
    };
  } catch (e: any) {
    console.error("WS Auth Failed:", e.message || e);
    // console.log("Token start:", token.substring(0, 10) + "..."); // Optional debug
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

    // Remove any stale connection for this user from registry
    const existingUserIndex = users.findIndex(u => u.userId === userId);
    if (existingUserIndex !== -1) {
      console.log(`Replacing stale connection for user: ${userId}`);
      users.splice(existingUserIndex, 1);
    }

    users.push({
      userId,
      rooms: [],
      ws,
      name: userData.name
    });

    ws.on('close', () => {
      const index = users.findIndex(u => u.ws === ws);
      if (index !== -1) {
        const user = users[index];
        if (user) {
          const uId = user.userId;
          const uRooms = [...user.rooms];
          console.log(`User registry cleanup: ${uId} disconnected`);
          users.splice(index, 1);

          // Notify others in rooms that this user left voice
          uRooms.forEach(room => {
            users.forEach(other => {
              if (other.rooms.includes(room)) {
                try {
                  other.ws.send(JSON.stringify({
                    type: "voice_left",
                    userId: uId,
                    roomId: room
                  }));
                } catch (e) {
                  // Ignore send errors for disconnected peers
                }
              }
            });
          });
        }
      }
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
      console.error("Failed to parse WS message:", e);
      return;
    }

    try {
      await processParsedMessage(parsedData);
    } catch (e) {
      console.error("Error processing WS message:", e);
    }
  }

  async function processParsedMessage(parsedData: any) {

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

    console.log("-----------------------------------");
    console.log("WebSocket message received:", parsedData.type, "from", userId);

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
      if (!roomIdStr || !shapeId) return;

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
      if (!roomIdStr || !shape || !shape.id) return;

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
    if (parsedData.type === "group_message") {
      const roomIdStr = parsedData.roomId;
      const message = parsedData.message;
      console.log(`Processing group_message for room ${roomIdStr}: ${message}`);

      const roomId = await resolveRoomId(roomIdStr, true);
      console.log(`Resolved roomId: ${roomId}`);

      if (roomId) {
        try {
          // Ensure roomMessage is defined in PrismaClient (after restart)
          console.log("Checking prismaClient.roomMessage...");
          if (!prismaClient.roomMessage) {
            console.error("CRITICAL: prismaClient.roomMessage is undefined! Please restart the backend.");
            return;
          }

          console.log("Saving message to DB...");
          const savedMessage = await prismaClient.roomMessage.create({
            data: {
              roomId,
              message,
              userId
            }
          });
          console.log("Message saved to DB:", savedMessage.id);

          // Find sender's name
          const sender = users.find(u => u.userId === userId);
          const senderName = sender ? sender.name : "Unknown User";

          let broadcastCount = 0;
          users.forEach(user => {
            if (user.rooms.includes(roomIdStr.toString())) {
              user.ws.send(JSON.stringify({
                type: "group_message",
                message: message,
                userId: userId,
                name: senderName,
                id: savedMessage.id,
                roomId: roomIdStr
              }));
              broadcastCount++;
            }
          });
          console.log(`Broadcasted to ${broadcastCount} users`);
        } catch (e) {
          console.error("Group message creation failed:", e);
        }
      } else {
        console.error("Could not resolve roomId for group_message:", roomIdStr);
      }
    }

    if (parsedData.type === "voice_query") {
      const roomIdStr = parsedData.roomId?.toString() || "";
      console.log(`Voice query in room: ${roomIdStr}`);
      users.forEach(user => {
        if (user.ws !== ws && user.rooms.includes(roomIdStr)) {
          user.ws.send(JSON.stringify({
            type: "voice_query",
            roomId: roomIdStr
          }));
        }
      });
    }

    if (parsedData.type === "voice_ready") {
      const roomIdStr = parsedData.roomId?.toString() || "";
      console.log(`User ${userId} ready for voice in room ${roomIdStr}`);
      // Broadcast to others in the room that this user is ready for voice
      users.forEach(user => {
        if (user.ws !== ws && user.rooms.includes(roomIdStr)) {
          user.ws.send(JSON.stringify({
            type: "voice_ready",
            userId: userId,
            name: users.find(u => u.ws === ws)?.name || "Unknown",
            roomId: roomIdStr
          }));
        }
      });
    }

    if (parsedData.type === "voice_signal") {
      const roomIdStr = parsedData.roomId?.toString() || "";
      const targetUserId = parsedData.targetUserId;
      const signal = parsedData.signal;

      console.log(`Voice signal [${signal.type || 'candidate'}] from ${userId} to ${targetUserId} in room ${roomIdStr}`);

      // Forward signaling data to a specific user
      const targetUser = users.find(u => u.userId === targetUserId && u.rooms.includes(roomIdStr));
      if (targetUser) {
        console.log(`Routing signal to ${targetUserId}`);
        targetUser.ws.send(JSON.stringify({
          type: "voice_signal",
          senderId: userId,
          senderName: users.find(u => u.ws === ws)?.name || "User",
          signal,
          roomId: roomIdStr
        }));
      } else {
        const roomPeers = users.filter(u => u.rooms.includes(roomIdStr)).map(u => u.userId);
        console.warn(`Signaling target ${targetUserId} not found in room ${roomIdStr}. Participants:`, roomPeers);
      }
    }

    if (parsedData.type === "voice_left") {
      const roomIdStr = parsedData.roomId;
      users.forEach(user => {
        if (user.ws !== ws && user.rooms.includes(roomIdStr.toString())) {
          user.ws.send(JSON.stringify({
            type: "voice_left",
            userId: userId,
            roomId: roomIdStr
          }));
        }
      });
    }

    if (parsedData.type === "voice_request") {
      const roomIdStr = parsedData.roomId?.toString() || "";
      console.log(`Voice request from ${userId} in room ${roomIdStr}`);
      // Forward request to all current voice participants in the room
      users.forEach(user => {
        if (user.ws !== ws && user.rooms.includes(roomIdStr)) {
          console.log(`Forwarding voice request to participant: ${user.userId}`);
          user.ws.send(JSON.stringify({
            type: "voice_request",
            userId: userId,
            name: users.find(u => u.ws === ws)?.name || "User",
            roomId: roomIdStr
          }));
        }
      });
    }

    if (parsedData.type === "voice_accept") {
      const roomIdStr = parsedData.roomId?.toString() || "";
      const targetUserId = parsedData.targetUserId;
      console.log(`Voice accept from ${userId} for ${targetUserId} in room ${roomIdStr}`);

      const targetUser = users.find(u => u.userId === targetUserId && u.rooms.includes(roomIdStr));
      if (targetUser) {
        console.log(`Forwarding voice accept to ${targetUserId}`);
        targetUser.ws.send(JSON.stringify({
          type: "voice_accept",
          roomId: roomIdStr
        }));
      } else {
        console.warn(`Target user ${targetUserId} not found for voice_accept in room ${roomIdStr}`);
      }
    }

    if (parsedData.type === "laser_pointer") {
      const roomIdStr = parsedData.roomId?.toString() || "";
      const x = parsedData.x;
      const y = parsedData.y;
      const user = users.find(u => u.ws === ws);

      users.forEach(u => {
        if (u.ws !== ws && u.rooms.includes(roomIdStr)) {
          u.ws.send(JSON.stringify({
            type: "laser_pointer",
            userId: user?.userId || "anon",
            name: user?.name || "User",
            x,
            y,
            roomId: roomIdStr
          }));
        }
      });
    }
  }


});