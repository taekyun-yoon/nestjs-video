import { ThrottlerGuard } from "@nestjs/throttler";
import { Injectable, Logger } from "@nestjs/common";

@Injectable()
export class ThrottlerBehindProxyGuard extends ThrottlerGuard {
    protected async getTracker(req: Record<string, any>): Promise<string> {
        Logger.log('ThrottleBehindProxyGuard' + req.ip);
        //서버가 프록시 서버 뒤에 있더라도 클라이언트 ip(req.ips[0])를 가져올 수 있음
        const ip = req.ips.length? req.ips[0] : req.ip;
        return super.getTracker(ip);
    }
}