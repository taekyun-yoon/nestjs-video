import { Video } from 'src/video/entity/video.entity';
import { Column, CreateDateColumn, Entity, OneToMany, PrimaryGeneratedColumn, UpdateDateColumn } from 'typeorm';
import { UserRole } from '../enum/user.enum';

@Entity()
export class User {
    //uuid: 네트워크에서 고유성이 보장되는 아이디, 개별 객체의 고유성 위해 사용
    @PrimaryGeneratedColumn('uuid')
    id: string;

    @Column({ unique: true })
    email: string;

    @Column()
    password: string;

    @Column({ type: 'enum', enum: UserRole, default: UserRole.Normal })
    role: UserRole;

    @CreateDateColumn({ name: 'created_at' })
    createdAt: Date;

    @UpdateDateColumn({ name: 'updated_at' })
    updatedAt: Date;

    @OneToMany(() => Video, (video) => video.user)
    videos: Video[];
}