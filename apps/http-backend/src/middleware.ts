import { NextFunction, Request, Response } from 'express';
import { verifyToken } from '@clerk/backend';
import { prismaClient } from '@repo/db/client';

interface CustomRequest extends Request {
    userId?: string;
}

export async function middleware(req: CustomRequest, res: Response, next: NextFunction) {
    const token = req.headers["authorization"] ?? "";

    try {
        const decoded = await verifyToken(token, {
            secretKey: process.env.CLERK_SECRET_KEY,
        });

        if (!decoded || !decoded.sub) {
            console.error("Auth failed: Invalid token or sub missing");
            res.status(403).json({
                message: "Unauthorized"
            });
            return;
        }

        const email = (decoded as any).email || (decoded as any).email_address || `${decoded.sub}@clerk.com`;
        const name = (decoded as any).name || (decoded as any).first_name || "User";

        // Sync user to local DB if not exists
        // Note: For a production app, use webhooks for syncing. 
        // This is a simplified version for development.
        await prismaClient.user.upsert({
            where: { id: decoded.sub },
            update: {
                email,
                name
            },
            create: {
                id: decoded.sub,
                email,
                password: "", // Not used with Clerk
                name
            }
        });

        req.userId = decoded.sub;
        next();
    } catch (err: any) {
        console.error("Auth error:", err);
        res.status(403).json({
            message: "Unauthorized - " + (err.message || "Unknown error"),
            detail: err.toString()
        });
    }
}