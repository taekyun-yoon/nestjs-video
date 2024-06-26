import { Module } from '@nestjs/common';
import { VideoService } from './video.service';
import { VideoController } from './video.controller';
import { TypeOrmModule } from '@nestjs/typeorm';
import { Video } from './entity/video.entity';
import { User } from 'src/user/entity/user.entity';

@Module({
  imports: [TypeOrmModule.forFeature([Video, User])],
  exports: [VideoService],
  providers: [VideoService],
  controllers: [VideoController]
})
export class VideoModule {}
