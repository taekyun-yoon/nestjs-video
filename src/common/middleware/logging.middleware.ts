import { Injectable, NestMiddleware } from "@nestjs/common";
import { NextFunction, Request, Response } from "express";

@Injectable()
export class LoggingMiddleware implements NestMiddleware {
    use(req: Request, res: Response, next: NextFunction) {
        const userAgent = req.headers['user-agent'] as string;
        const ipAddress = req.ip || req.headers['x-forwarded-for'];

        req['userAgent'] = userAgent;
        req['ipAddress'] = ipAddress;

        next();
    }
}