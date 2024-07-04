import { Injectable, Logger, NestMiddleware } from "@nestjs/common";
import { NextFunction, Request, Response } from "express";

@Injectable()
export class LoggingMiddleware implements NestMiddleware {
    private logger = new Logger('HTTP');

    use(req: Request, res: Response, next: NextFunction) {

        const userAgent = req.headers['user-agent'] as string;
        const ipAddress = req.ip || req.headers['x-forwarded-for'];

        req['userAgent'] = userAgent;
        req['ipAddress'] = ipAddress;

        res.on('close', () => {
            const { statusCode } = res;
            const contentLength = res.get('content-length');
            this.logger.log(`${req.method} ${req.url} ${req.statusCode} ${contentLength} - ${userAgent} ${ipAddress}`);
        })

        next();
    }
}