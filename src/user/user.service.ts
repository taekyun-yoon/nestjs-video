import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { User } from './entity/user.entity';
import { Repository } from 'typeorm';

@Injectable()
export class UserService {
    constructor(
        @InjectRepository(User)
        private readonly userRepository: Repository<User>
    ){}

    async findAll(page: number, size: number) {
        const users = this.userRepository.find({ })
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
}
