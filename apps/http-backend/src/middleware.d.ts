import { NextFunction, Request, Response } from 'express';
interface CustomRequest extends Request {
    userId?: number;
}
export declare function middleware(req: CustomRequest, res: Response, next: NextFunction): void;
export {};
//# sourceMappingURL=middleware.d.ts.map