import { NextFunction, Request, Response } from 'express';
import jwt from 'jsonwebtoken';
import { JWT_SECRET } from './config';

interface CustomRequest extends Request {
    userId?: number;
}

export function middleware(req: CustomRequest, res: Response, next: NextFunction) {
    const token = req.headers["authorization"] ?? "";

    try {
        const decoded = jwt.verify(token, JWT_SECRET) as { userId: number };
        req.userId = decoded.userId;
        next();
    } catch (err) {
        res.status(403).json({
            message: "Unauthorized"
        });
    }
}