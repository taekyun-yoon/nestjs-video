import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { User } from './entity/user.entity';
import { Repository } from 'typeorm';
import { UserRole } from './enum/user.enum';

@Injectable()
export class UserService {
    constructor(
        @InjectRepository(User)
        private readonly userRepository: Repository<User>
    ){}

    async findAll(page: number, size: number) {
        const users = this.userRepository.find({ 
            skip: (page - 1) * size,
            take: size,
        })
        return users;
    }

    async findUser(id: string) {
        const user = await this.userRepository.findOneBy({ id });
        if(!user) throw new NotFoundException('No user');
        return user;
    }

    async createUser(email: string, encryptedPassword: string) {
        const user = this.userRepository.create({ email: email, password: encryptedPassword });
        await this.userRepository.save(user);
        if(!user) throw new NotFoundException('No user');
        return user;
    }

    async findOneByEmail(email: string) {
        const user = await this.userRepository.findOneBy({ email: email});
        return user;
    }

    async checkUserIsAdmin(id: string) {
        const user = await this.userRepository.findOneBy({ id });
        return user.role === UserRole.Admin;
    }

    async createBulk(){
        for(let i = 0; i <= 100000; i++) {
        await this.userRepository.save(
            this.userRepository.create({ email: `nestjs${i}@nestjs.com`, password: 'Password1!' }))
        }
    }
}
