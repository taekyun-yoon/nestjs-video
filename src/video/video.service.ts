import { Injectable, NotFoundException } from '@nestjs/common';
import { Video } from './entity/video.entity';
import { Repository } from 'typeorm';
import { InjectRepository } from '@nestjs/typeorm';
import { ReadStream, createReadStream } from 'fs';
import { join } from 'path';
import { stat } from 'fs/promises';

@Injectable()
export class VideoService {
    constructor(
        @InjectRepository(Video) private readonly videoRepository: Repository<Video>
    ){}
    async findOne(id: string) {
        const video = await this.videoRepository.findOne({ relations: ['user'], where: { id } });
        if(!video) throw new NotFoundException('No Video');
        return video;
    }
    findAll() {
        return "video list";
    }
    create() {
        return "video create";
    }

    async download(id: string): Promise<{ stream: ReadStream, mimetype: string, size: number }> {
        const video = await this.videoRepository.findOneBy({ id });
        if(!video) throw new NotFoundException('No Video');

        await this.videoRepository.update({ id }, {downloadCnt: ()=> 'download_cnt + 1'});
        const { mimetype } = video;
        const extension = mimetype.split('/')[1];
        const videoPath = join(process.cwd(), 'video-storage', `${video.title}.${extension}`);
        const { size } = await stat(videoPath);
        const stream = createReadStream(videoPath);
        return { stream, mimetype, size };
    }

}
