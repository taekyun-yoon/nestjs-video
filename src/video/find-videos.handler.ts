import { Injectable } from "@nestjs/common";
import { IQueryHandler, QueryHandler } from "@nestjs/cqrs";
import { FindVideosQuery } from "./query/find-videos.query";
import { InjectRepository } from "@nestjs/typeorm";
import { Video } from "./entity/video.entity";
import { Repository } from "typeorm";

@Injectable()
@QueryHandler(FindVideosQuery)
export class FindVideosQueryHandler implements IQueryHandler<FindVideosQuery>{
    constructor(@InjectRepository(Video) private videoRepository: Repository<Video>) {}
    
    async execute({ page, size }: FindVideosQuery): Promise<any> {
        const video = await this.videoRepository.find({ relations: ['user'], skip: (page - 1) * size});
        return video;
    }
    
}