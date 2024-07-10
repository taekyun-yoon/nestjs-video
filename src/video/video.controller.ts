import { map } from 'rxjs';
import { Body, Controller, Get, Param, Post, Query, UseGuards } from '@nestjs/common';
import { ApiBearerAuth, ApiTags } from '@nestjs/swagger';
import { ApiPostResponse } from 'src/common/decorator/swagger.decorator';
import { VideoService } from './video.service';
import { PageReqDto } from 'src/common/dto/req.dto';
import { CreateVideoReqDto, FindVideoReqDto } from './dto/req.dto';
import { ThrottlerBehindProxyGuard } from 'src/common/guard/throttler-behind-proxy.guard';
import { Throttle } from '@nestjs/throttler';
import { CurrentUser } from 'src/common/decorator/currentUser.decorator';
import { UserAfterAuth } from 'src/common/dto/user.dto';
import { CreateVideoCommand } from './command/create-video.command';
import { CommandBus, QueryBus } from '@nestjs/cqrs';
import { CreateVideoResDto } from './dto/res.dto';
import { FindVideosQuery } from './query/find-videos.query';

@ApiTags('Video')
@ApiBearerAuth()
@UseGuards(ThrottlerBehindProxyGuard) 
@Controller('video')
export class VideoController {
    constructor(
        private readonly videoService: VideoService,
        private commandBus: CommandBus,
        private queryBus: QueryBus,
        ){}

    @Post()
    async upload(@Body() createVideoReqDto: CreateVideoReqDto, @CurrentUser() user: UserAfterAuth): Promise<CreateVideoResDto> {
        const { title, video } = createVideoReqDto;
        const command = new CreateVideoCommand(user.id, title, 'video/mp4', 'mp4', Buffer.from(''));
        const { id } = await this.commandBus.execute(command);
        return { id, title};
    }

    @Get()
    async findAll(@Query() { page, size }: PageReqDto) {
        const findVideosQuery = new FindVideosQuery(page, size);
        const videos = await this.queryBus.execute(findVideosQuery);
        return videos.map(({ id, title, user }) => {
            return {
                id,
                title,
                user: {
                    id: user.id,
                    email: user.email
                },
            };
        });
    }

    @Get(':id')
    findOne(@Param() { id }: FindVideoReqDto) {
        return this.videoService.findOne(id);
    }
    
}
