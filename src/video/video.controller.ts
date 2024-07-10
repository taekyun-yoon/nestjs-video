import { Body, Controller, Get, Param, Post, Query, UseGuards } from '@nestjs/common';
import { ApiBearerAuth, ApiTags } from '@nestjs/swagger';
import { ApiPostResponse } from 'src/common/decorator/swagger.decorator';
import { VideoService } from './video.service';
import { PageReqDto } from 'src/common/dto/req.dto';
import { CreateVideoReqDto, FindVideoReqDto } from './dto/req.dto';
import { ThrottlerBehindProxyGuard } from 'src/common/guard/throttler-behind-proxy.guard';
import { Throttle } from '@nestjs/throttler';

@ApiTags('Video')
@ApiBearerAuth()
@UseGuards(ThrottlerBehindProxyGuard) 
@Controller('video')
export class VideoController {
    constructor(private readonly videoService: VideoService){}

    @Post()
    upload(@Body() createVideoReqDto: CreateVideoReqDto) {
        return this.videoService.create();
    }

    @Get()
    findAll(@Query() { page, size }: PageReqDto) {
        return this.videoService.findAll();
    }

    @Get(':id')
    findOne(@Param() { id }: FindVideoReqDto) {
        return this.videoService.findOne(id);
    }
    
}
