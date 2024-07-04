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

        if(!this.encryptionKey || this.encryptionKey.length !== 32) {
            throw new Error('EncryptionKey must be 32 bytes (256 bits) long for AES-256-CBC.');
        }
    }

    async signup(email: string, password: string) {
        const user = await this.getUserByEmail(email);
        if(user) throw new BadRequestException('Email is already existed');
        const encryptedPassword = await this.encryptPassword(password);
        const newUser = await this.userService.createUser(email, encryptedPassword);
        return newUser;
    }

    async login(email: string, password: string, userAgent: string, ipAddress: string){
        const user = await this.getUserByEmail(email);
        if(!user) throw new UnauthorizedException();

        const MAX_ATTEMPT = 10;
        const attempts = await this.redis.get(`login_attempts:${email}`) || '0';
        console.log('attempts: ', attempts);
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

        const { encryptedToken, iv } = this.encrypt(refreshToken);
        await this.redis.set(user.id, `${iv.toString('hex')}:${encryptedToken.toString('hex')}`);

        return {
            accessToken: accessToken,
            refreshToken: refreshToken
        }
    }

    async refresh(refreshToken: string) {
        try{
            const payload = this.jwtService.verify(refreshToken, { ignoreExpiration: false });
            console.log('payload: ', payload);

            const storedToken = await this.redis.get(payload.sub);
            if (!storedToken) {
                throw new UnauthorizedException('Invalid refresh token');
            }
            
            const [storedIvHex, storedEncryptedTokenHex] = storedToken.split(':');
            const storedIv = Buffer.from(storedIvHex, 'hex');
            const storedEncryptedToken = Buffer.from(storedEncryptedTokenHex, 'hex');

            const decryptedToken = this.decrypt(storedEncryptedToken, storedIv);
            
            if(decryptedToken !== refreshToken) {
                console.log('different');
                throw new UnauthorizedException('Invalid refresh token');
            }

            const newAccessToken = this.generateAccessToken(payload.sub);
            const newRefreshToken = this.generateRefreshToken(payload.sub);

            const { encryptedToken: newEncryptionToken, iv: newIv }= this.encrypt(newRefreshToken);
            await this.redis.set(payload.sub, `${newIv.toString('hex')}:${newEncryptionToken.toString('hex')}`);

            return { newAccessToken, newRefreshToken };
        } catch(e) {
            console.log(e);
            throw new UnauthorizedException('Invalid refresh token');
        }
    }

    private generateAccessToken(userId: string) {
        const payload = { sub: userId, tokenType: 'access' };
        return this.jwtService.sign(payload, { expiresIn: '2h' });
    }

    private generateRefreshToken(userId: string) {
        const payload = { sub: userId, tokenType: 'refresh' };
        return this.jwtService.sign(payload, { expiresIn: '7d' });
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
        try {
            const IV_LENGTH = 16;
            let iv = randomBytes(IV_LENGTH);
            
            const keyBuffer = Buffer.alloc(32);

            Buffer.from(this.encryptionKey).copy(keyBuffer);

            let cipher = createCipheriv('aes-256-cbc', keyBuffer, iv);
            let encrypted = cipher.update(token);
    
            encrypted = Buffer.concat([encrypted, cipher.final()]);
            return {
                encryptedToken: encrypted,
                iv: iv
            }
        } catch (error) {
            throw new Error('Encryption failed: ' + error.message);
        }
    }
    
    private decrypt(encryptedText: Buffer, iv: Buffer) {
        try {
            const decipher = createDecipheriv('aes-256-cbc', Buffer.from(this.encryptionKey), iv);
            let decrypted = decipher.update(encryptedText);
            decrypted = Buffer.concat([decrypted, decipher.final()]);
    
            return decrypted.toString();
        } catch (error) {
            throw new Error('Decryption failed: ' + error.message);
        }
    }
    
}