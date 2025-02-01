import jwt from 'jsonwebtoken';
import { JWT_SECRET } from '@repo/backend-common/config';
export function middleware(req, res, next) {
    const token = req.headers["authorization"] ?? "";
    try {
        const decoded = jwt.verify(token, JWT_SECRET);
        req.userId = decoded.userId;
        next();
    }
    catch (err) {
        res.status(403).json({
            message: "Unauthorized"
        });
    }
}
