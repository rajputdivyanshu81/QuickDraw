import express, { Request, Response } from 'express';
import { middleware } from './middleware.js';
import { CreateRoomSchema } from '@repo/common/types';
import { prismaClient } from '@repo/db/client';
import cors from "cors";
import PptxGenJS from "pptxgenjs";
import dotenv from "dotenv";

dotenv.config();

const app = express();
app.use(express.json());
app.use(cors());

console.log("HTTP Backend starting...");
console.log("CLERK_SECRET_KEY present:", !!process.env.CLERK_SECRET_KEY);
console.log("DATABASE_URL present:", !!process.env.DATABASE_URL);

app.post("/room", middleware, async (req: Request, res: Response) => {
    const parsedData = CreateRoomSchema.safeParse(req.body);
    if (!parsedData.success) {
        res.json({
            message: "Incorrect inputs"
        })
        return;
    }
    // @ts-ignore: TODO: Fix this
    const userId = req.userId;

    try {
        const room = await prismaClient.room.create({
            data: {
                slug: parsedData.data.name,
                adminId: userId
            }
        })

        res.json({
            roomId: room.id
        })
    } catch (e) {
        res.status(411).json({
            message: "Room already exists with this name"
        })
    }
})

app.get("/chats/:roomId", middleware, async (req: Request, res: Response) => {
    try {
        const roomIdStr = req.params.roomId;
        let roomId = Number(roomIdStr);

        if (isNaN(roomId)) {
            // Must be a slug, resolve it to ID
            const room = await prismaClient.room.findFirst({
                where: { slug: roomIdStr }
            });
            if (room) {
                roomId = room.id;
            } else {
                res.json({ messages: [] });
                return;
            }
        }

        const messages = await prismaClient.chat.findMany({
            where: {
                roomId: roomId
            },
            orderBy: {
                id: "asc"
            },
            take: 1000
        });

        res.json({
            messages
        })
    } catch (e) {
        console.log(e);
        res.json({
            messages: []
        })
    }
})

app.get("/room/:slug", async (req: Request, res: Response) => {
    const slug = req.params.slug;
    const room = await prismaClient.room.findFirst({
        where: {
            slug
        }
    });

    res.json({
        room
    })
})




app.post("/ai-chat", async (req: Request, res: Response) => {
    const { messages } = req.body;
    const apiKey = process.env.GROQ_API_KEY;

    if (!apiKey) {
        res.status(500).json({ message: "AI service not configured" });
        return;
    }

    try {
        const response = await fetch("https://api.groq.com/openai/v1/chat/completions", {
            method: "POST",
            headers: {
                "Authorization": `Bearer ${apiKey}`,
                "Content-Type": "application/json"
            },
            body: JSON.stringify({
                messages: messages,
                model: "llama-3.3-70b-versatile"
            })
        });

        const data = await response.json();
        if (!response.ok) {
            throw new Error(data.error?.message || "Failed to fetch from Groq");
        }

        res.json(data);
    } catch (e: any) {
        console.error("AI Chat Error:", e);
        res.status(500).json({ message: e.message || "Internal Server Error" });
    }
});

app.post("/generate-ppt", async (req: Request, res: Response) => {
    try {
        const { slides } = req.body;
        if (!slides || !Array.isArray(slides)) {
            res.status(400).json({ message: "Invalid slides data" });
            return;
        }

        const pres = new PptxGenJS();

        slides.forEach((slideData: { image: string }, index: number) => {
            const slide = pres.addSlide();
            // Handle base64 image data
            if (slideData.image) {
                slide.addImage({
                    data: slideData.image,
                    x: "10%",
                    y: "10%",
                    w: "80%",
                    h: "80%",
                    sizing: { type: "contain", w: "80%", h: "80%" }
                });
            }
        });

        const buffer = await pres.write({ outputType: "nodebuffer" });

        res.setHeader("Content-Disposition", "attachment; filename=presentation.pptx");
        res.setHeader("Content-Type", "application/vnd.openxmlformats-officedocument.presentationml.presentation");
        res.send(buffer);

    } catch (e: any) {
        console.error("PPT Generation Error:", e);
        res.status(500).json({ message: "Failed to generate PPT" });
    }
});

app.listen(3001, () => {
    console.log('Server is running on port 3001');
});