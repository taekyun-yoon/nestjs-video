import { BadRequestException, Inject, Injectable, UnauthorizedException } from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import { hash, compare } from 'bcrypt';
import { UserService } from 'src/user/user.service';
import { LoginResDto } from './dto/res.dto';
import { Redis } from 'ioredis';
import { ConfigService } from '@nestjs/config';
import { createCipheriv, createDecipheriv, randomBytes } from 'crypto';
import { InjectRedis } from '@nestjs-modules/ioredis';


@Injectable()
export class AuthService {
    private readonly encryptionKey: string;
    constructor(
        private userService: UserService,
        private jwtService: JwtService,
        @InjectRedis() private readonly redis: Redis,
        private configService: ConfigService,
    ){
        this.encryptionKey = this.configService.get<string>('ENCRYPTION_KEY');
    }

    async signup(email: string, password: string) {
        const user = await this.getUserByEmail(email);
        if(user) throw new BadRequestException('Email is already existed');
        const encryptedPassword = await this.encryptPassword(password);
        const newUser = await this.userService.createUser(email, encryptedPassword);
        return newUser;
    }

    async login(email: string, password: string, userAgent: string, ipAddress: string): Promise<LoginResDto> {
        const user = await this.getUserByEmail(email);
        if(!user) throw new UnauthorizedException();

        const MAX_ATTEMPT = 10;
        const attempts = await this.redis.get(`login_attempts:${email}`) || '0';
3
        if(Number(attempts) >= MAX_ATTEMPT) throw new UnauthorizedException('Too many login attempts, please try agin later.');

        const isMatch = await compare(password, user.password);
        if(!isMatch) {
            await this.redis.incr(`login_attempts:${email}`);
            throw new UnauthorizedException();
        }

        await this.redis.del(`login_attempts:${email}`);

        const accessToken = this.generateAccessToken(user.id);
        const refreshToken = this.generateRefreshToken(user.id);

        await this.storeDeviceInformation(user.id, userAgent, ipAddress);


        const encryptedRefreshToken = this.encrypt(refreshToken);
        await this.redis.set(user.id, encryptedRefreshToken);

        return {
            accessToken: accessToken,
            refreshToken: refreshToken
        }
    }

    private generateAccessToken(userId: string) {
        const payload = { sub: userId, tokenType: 'access' };
        return this.jwtService.sign(payload, { expiresIn: '1d' });
    }

    private generateRefreshToken(userId: string) {
        const payload = { sub: userId, tokenType: 'refresh' };
        return this.jwtService.sign(payload, { expiresIn: '30d' });
    }

    private async storeDeviceInformation(userId: string, userAgent: string, ipAddress: string) {
        const deviceInfoKey = `device_info:${userId}`;
        const existingDeviceInfo = await this.redis.get(deviceInfoKey);
        let deviceInfo: any = {};

        if(existingDeviceInfo) {
            deviceInfo = JSON.parse(existingDeviceInfo);
        }

        deviceInfo[userAgent] = ipAddress;

        await this.redis.set(deviceInfoKey, JSON.stringify(deviceInfo));
    }

    async encryptPassword(password: string) {
        const DEFAULT_SALT = 11;
        return await hash(password, DEFAULT_SALT);
    }

    async getUserByEmail(email: string) {
        return await this.userService.findOneByEmail(email);
    }

    private encrypt(token: string) {
        console.log('encryptionKey: ', this.encryptionKey);
        const IV_LENGTH = 16;
        let iv = randomBytes(IV_LENGTH);
    
        if (!this.encryptionKey) {
            throw new Error('Encryption key is not defined');
        }
    
        let cipher = createCipheriv('aes-256-cbc', Buffer.from(this.encryptionKey), iv);
        let encrypted = cipher.update(token);
    
        encrypted = Buffer.concat([encrypted, cipher.final()]);
    
        return iv.toString('hex') + ':' + encrypted.toString('hex');
    }
    

    private decrypt(text: string) {
        const textParts = text.split(':');
        const iv = Buffer.from(textParts.shift(), 'hex');
        const encryptedText = Buffer.from(textParts.join(':'), 'hex');

        const decipher = createDecipheriv('aes-256-cbc', Buffer.from(this.encryptionKey, 'hex'), iv);
        let decrypted = decipher.update(encryptedText);
        decrypted = Buffer.concat([decrypted, decipher.final()]);

        return decrypted.toString();
    }
}