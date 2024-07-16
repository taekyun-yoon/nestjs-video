import { ConflictException, Injectable } from "@nestjs/common";
import { CommandHandler, EventBus, ICommandHandler } from "@nestjs/cqrs";
import { CreateVideoCommand } from "./command/create-video.command";
import { DataSource } from "typeorm";
import { Video } from "./entity/video.entity";
import { User } from "src/user/entity/user.entity";
import { VideoCreatedEvent } from "./event/video-created.event";
import { writeFile } from "fs/promises";
import { join } from "path";

@Injectable()
@CommandHandler(CreateVideoCommand)
export class CreateVideoHandler implements ICommandHandler<CreateVideoCommand> {
    constructor(private dataSource: DataSource, private eventBus: EventBus){}

    async execute(command: CreateVideoCommand): Promise<Video> {
        const { userId, title, mimetype, extension, buffer } = command;
        const queryRunner = this.dataSource.createQueryRunner();
        await queryRunner.startTransaction();
        let error;

        try{
            const user = await queryRunner.manager.findOneBy(User, { id: userId });
            const existingVideo = await queryRunner.manager.findOne(Video, { where: { title } });
            if (existingVideo) {
                throw new ConflictException('이미 존재하는 비디오 제목입니다. 다른 제목을 사용해 주세요.');
            }

            const video = await queryRunner.manager.save(queryRunner.manager.create(Video, { title, mimetype, user }))
            await this.uploadVideo(video.id, video.title, extension, buffer);
            await queryRunner.commitTransaction();
            this.eventBus.publish(new VideoCreatedEvent(video.id));
            return video
        } catch (e) {
            await queryRunner.rollbackTransaction();
            error = e;
        } finally {
            await queryRunner.release();
            if(error) throw error;
        }
    }
    private async uploadVideo(id: string, title: string, extension: string, buffer: Buffer) {
        console.log('upload video');
        const filePath = join(process.cwd(), 'video-storage', `${title}.${extension}`);
        await writeFile(filePath, buffer);
    }

}