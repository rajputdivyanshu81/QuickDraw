import express, { Request, Response } from 'express';
import { middleware } from './middleware.js';
import { CreateRoomSchema } from '@repo/common/types';
import { prismaClient } from '@repo/db/client';
import cors from "cors";
import PptxGenJS from "pptxgenjs";
import dotenv from "dotenv";
import { generatePaymentHash, verifyPaymentResponse } from './payment.js';

dotenv.config();

const app = express();
app.use(express.json({ limit: "50mb" }));
app.use(express.urlencoded({ limit: "50mb", extended: true }));
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
        const roomIdStr = req.params.roomId as string;
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
    const slug = req.params.slug as string;
    const room = await prismaClient.room.findFirst({
        where: {
            slug
        }
    });

    res.json({
        room
    })
})

app.get("/document/:roomId", middleware, async (req: Request, res: Response) => {
    try {
        const roomIdStr = req.params.roomId as string;
        let roomId = Number(roomIdStr);
        let room;

        if (isNaN(roomId)) {
            room = await prismaClient.room.findFirst({ where: { slug: roomIdStr } });
        } else {
            room = await prismaClient.room.findFirst({ where: { id: roomId } });
        }

        if (!room) {
            res.status(404).json({ message: "Room not found" });
            return;
        }

        res.json({ document: room.document || "" });
    } catch (e) {
        console.error(e);
        res.status(500).json({ message: "Error fetching document" });
    }
});

app.put("/document/:roomId", middleware, async (req: Request, res: Response) => {
    try {
        const roomIdStr = req.params.roomId as string;
        let roomId = Number(roomIdStr);
        const { document } = req.body;

        if (isNaN(roomId)) {
            const room = await prismaClient.room.findFirst({ where: { slug: roomIdStr } });
            if (room) roomId = room.id;
        }

        if (isNaN(roomId)) {
            res.status(404).json({ message: "Room not found" });
            return;
        }

        await prismaClient.room.update({
            where: { id: roomId },
            data: { document }
        });

        res.json({ success: true });
    } catch (e) {
        console.error(e);
        res.status(500).json({ message: "Error updating document" });
    }
});




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
        pres.layout = "LAYOUT_16x9"; // 10 x 5.625 inches

        slides.forEach((slideData: any) => {
            const slide = pres.addSlide();

            if (slideData.elements && Array.isArray(slideData.elements) && slideData.elements.length > 0) {
                const captureW = slideData.width || 800;
                const captureH = slideData.height || 600;
                const scaleX = 10 / captureW;      // inches per pixel
                const scaleY = 5.625 / captureH;   // inches per pixel
                const shapeFill = slideData.bgColor 
                    ? { color: slideData.bgColor.replace("#", "") } 
                    : { color: "ffffff" };

                if (slideData.bgColor) {
                    slide.background = { color: slideData.bgColor.replace("#", "") };
                }

                if (slideData.pencilImage) {
                    slide.addImage({
                        data: slideData.pencilImage,
                        x: 0, y: 0, w: 10, h: 5.625,
                    });
                }

                for (const el of slideData.elements) {
                    const colorVal = (el.color || "ffffff").replace("#", "");
                    const color = colorVal === "black" ? "000000" : colorVal;

                    switch (el.type) {
                        case "rect":
                            slide.addShape(pres.ShapeType.rect, {
                                x: el.x * scaleX,
                                y: el.y * scaleY,
                                w: el.width * scaleX,
                                h: el.height * scaleY,
                                line: { color, width: 1.5 },
                                fill: shapeFill,
                            });
                            break;
                        case "circle":
                            slide.addShape(pres.ShapeType.ellipse, {
                                x: (el.centerX - el.radius) * scaleX,
                                y: (el.centerY - el.radius) * scaleY,
                                w: el.radius * 2 * scaleX,
                                h: el.radius * 2 * scaleY,
                                line: { color, width: 1.5 },
                                fill: shapeFill,
                            });
                            break;
                        case "line":
                            const lx = Math.min(el.startX, el.endX);
                            const ly = Math.min(el.startY, el.endY);
                            const lw = Math.abs(el.endX - el.startX);
                            const lh = Math.abs(el.endY - el.startY);
                            slide.addShape(pres.ShapeType.line, {
                                x: lx * scaleX,
                                y: ly * scaleY,
                                w: lw * scaleX,
                                h: lh * scaleY,
                                line: { color, width: 1.5 },
                                flipV: (el.startX < el.endX) !== (el.startY < el.endY),
                            });
                            break;
                        case "text":
                            slide.addText(el.text, {
                                x: el.x * scaleX,
                                y: (el.y - 20) * scaleY,
                                w: Math.max((el.text.length * 12) * scaleX, 1),
                                h: 0.4,
                                fontSize: 15,
                                fontFace: "Arial",
                                color: color,
                                autoFit: true,
                            });
                            break;
                        case "image":
                            slide.addImage({
                                data: el.data,
                                x: el.x * scaleX,
                                y: el.y * scaleY,
                                w: el.width * scaleX,
                                h: el.height * scaleY,
                            });
                            break;
                        case "pencil":
                            if (el.points && el.points.length >= 2) {
                                for (let i = 0; i < el.points.length - 1; i++) {
                                    const p1 = el.points[i];
                                    const p2 = el.points[i + 1];
                                    const lx = Math.min(p1.x, p2.x);
                                    const ly = Math.min(p1.y, p2.y);
                                    const lw = Math.abs(p2.x - p1.x);
                                    const lh = Math.abs(p2.y - p1.y);
                                    slide.addShape(pres.ShapeType.line, {
                                        x: lx * scaleX,
                                        y: ly * scaleY,
                                        w: Math.max(lw, 0.1) * scaleX,
                                        h: Math.max(lh, 0.1) * scaleY,
                                        line: { color, width: 1.5 },
                                        flipV: (p1.x < p2.x) !== (p1.y < p2.y),
                                    });
                                }
                            }
                            break;
                    }
                }
            } else if (slideData.image) {
                // Fallback to old behavior
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

app.post("/api/create-payment", middleware, async (req: Request, res: Response) => {
    // @ts-ignore
    const userId = req.userId;
    const { amount, productInfo, firstName, email } = req.body;

    if (!process.env.PAYU_MERCHANT_KEY || !process.env.PAYU_MERCHANT_SALT) {
        console.error("CRITICAL: PAYU_MERCHANT_KEY or PAYU_MERCHANT_SALT missing in .env");
        res.status(500).json({ message: "Payment gateway not configured. Merchant Key or Salt missing in backend .env" });
        return;
    }

    const txnid = `tx_${Date.now()}_${Math.random().toString(36).substring(2, 7)}`;

    try {
        await prismaClient.payment.create({
            data: {
                txnId: txnid,
                amount: parseFloat(amount),
                status: "PENDING",
                userId: userId
            }
        });

        const hash = generatePaymentHash({
            key: process.env.PAYU_MERCHANT_KEY,
            txnid: txnid,
            amount: amount,
            productinfo: productInfo,
            firstname: firstName,
            email: email,
            salt: process.env.PAYU_MERCHANT_SALT
        });

        res.json({
            key: process.env.PAYU_MERCHANT_KEY,
            txnid: txnid,
            amount: amount,
            productinfo: productInfo,
            firstname: firstName,
            email: email,
            phone: '9999999999',
            hash: hash,
            surl: `${process.env.FRONTEND_URL || 'http://localhost:3000'}/payment-success`,
            furl: `${process.env.FRONTEND_URL || 'http://localhost:3000'}/payment-failure`
        });
    } catch (e) {
        console.error("Create payment error:", e);
        res.status(500).json({ message: "Failed to initiate payment" });
    }
});

app.post("/api/payment-callback", async (req: Request, res: Response) => {
    const payuData = req.body;

    if (!process.env.PAYU_MERCHANT_SALT) {
        res.status(500).json({ message: "Auth config missing" });
        return;
    }

    const isValid = verifyPaymentResponse(payuData, process.env.PAYU_MERCHANT_SALT);

    if (!isValid) {
        console.error("Invalid payment hash received!");
        res.status(400).send("Invalid Hash");
        return;
    }

    const { txnid, status } = payuData;

    try {
        if (status === "success") {
            const payment = await prismaClient.payment.update({
                where: { txnId: txnid },
                data: { status: "SUCCESS" }
            });

            await prismaClient.user.update({
                where: { id: payment.userId },
                data: { isLifetimeSubscriber: true }
            });

            console.log(`Payment success: ${txnid} for user ${payment.userId}`);
        } else {
            await prismaClient.payment.update({
                where: { txnId: txnid },
                data: { status: "FAILURE" }
            });
        }

        res.status(200).send("Callback Processed");
    } catch (e) {
        console.error("Payment callback processing error:", e);
        res.status(500).send("Error");
    }
});

const PORT = process.env.PORT || 3001;
app.listen(PORT, () => {
    console.log(`Server is running on port ${PORT}`);
});