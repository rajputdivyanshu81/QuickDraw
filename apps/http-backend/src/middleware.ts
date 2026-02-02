import { NextFunction, Request, Response } from 'express';
import { verifyToken } from '@clerk/backend';
import { prismaClient } from '@repo/db/client';

interface CustomRequest extends Request {
    userId?: string;
}

export async function middleware(req: CustomRequest, res: Response, next: NextFunction) {
    const token = req.headers["authorization"] ?? "";
    let jwt: string = "";

    if (!process.env.CLERK_SECRET_KEY) {
        console.error("CRITICAL ERROR: CLERK_SECRET_KEY is missing in http-backend environment variables!");
        res.status(500).json({ message: "Internal Server Error: Missing Auth Config" });
        return;
    }

    try {
        console.log("Middleware received Authorization header:", token ? token.substring(0, 50) + "..." : "EMPTY");

        // Remove 'Bearer ' prefix if present
        jwt = token.startsWith("Bearer ") ? token.split(" ")[1] ?? token : token;
        console.log("Extracted JWT for verification:", jwt ? jwt.substring(0, 20) + "..." : "EMPTY");

        const decoded = await verifyToken(jwt, {
            secretKey: process.env.CLERK_SECRET_KEY,
        });

        if (!decoded || !decoded.sub) {
            console.error("Auth failed: Invalid token or sub missing. Decoded object:", decoded);
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
        console.error("Auth error details:", {
            message: err.message,
            stack: err.stack,
            reason: err.reason, // Clerk specific sometimes
            tokenSnippet: jwt ? jwt.substring(0, 10) + "..." : "NONE",
            keySnippet: process.env.CLERK_SECRET_KEY ? process.env.CLERK_SECRET_KEY.substring(0, 10) + "..." : "NONE"
        });
        res.status(403).json({
            message: "Unauthorized",
            debug: err.message || "Unknown auth error",
            stack: err.stack
        });
    }
}