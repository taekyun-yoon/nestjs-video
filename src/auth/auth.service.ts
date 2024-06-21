import { BadRequestException, Injectable, UnauthorizedException } from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import { hash, compare } from 'bcrypt';
import { UserService } from 'src/user/user.service';

@Injectable()
export class AuthService {
    constructor(
        private userService: UserService,
        private jwtService: JwtService
    ){}

    async signup(email: string, password: string) {
        const user = await this.getUserByEmail(email);
        if(user) throw new BadRequestException('Email is already existed');
        const encryptedPassword = await this.encryptPassword(password);
        const newUser = await this.userService.createUser(email, encryptedPassword);
        return newUser;
    }

    async login(email: string, password: string) {
        const user = await this.getUserByEmail(email);
        if(!user) throw new UnauthorizedException();

        const isMatch = await compare(password, user.password);
        if(!isMatch) throw new UnauthorizedException();

        return {
            accessToken: this.jwtService.sign({ sub: user.id }),
        }
    }

    async encryptPassword(password: string) {
        const DEFAULT_SALT = 11;
        return await hash(password, DEFAULT_SALT);
    }

    async getUserByEmail(email: string) {
        return await this.userService.findOneByEmail(email);
    }
}
