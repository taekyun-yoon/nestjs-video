import { Module } from '@nestjs/common';
import { VideoService } from './video.service';
import { VideoController } from './video.controller';
import { TypeOrmModule } from '@nestjs/typeorm';
import { Video } from './entity/video.entity';
import { User } from 'src/user/entity/user.entity';
import { CqrsModule } from '@nestjs/cqrs';
import { CreateVideoHandler } from './create-video.handler';
import { VideoCreatedHandler } from './video-created.handler';
import { FindVideosQueryHandler } from './find-videos.handler';

@Module({
  imports: [TypeOrmModule.forFeature([Video]), CqrsModule],
  controllers: [VideoController],
  providers: [VideoService, CreateVideoHandler, VideoCreatedHandler, FindVideosQueryHandler],
  exports: [VideoService],
})
export class VideoModule {}
