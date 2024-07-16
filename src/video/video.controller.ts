import { map } from 'rxjs';
import { Body, Controller, Get, HttpStatus, Param, ParseFilePipeBuilder, Post, Query, UploadedFile, UseGuards, UseInterceptors } from '@nestjs/common';
import { ApiBearerAuth, ApiConsumes, ApiExtraModels, ApiTags } from '@nestjs/swagger';
import { ApiGetItemsResponse, ApiPostResponse } from 'src/common/decorator/swagger.decorator';
import { VideoService } from './video.service';
import { PageReqDto } from 'src/common/dto/req.dto';
import { CreateVideoReqDto, FindVideoReqDto } from './dto/req.dto';
import { ThrottlerBehindProxyGuard } from 'src/common/guard/throttler-behind-proxy.guard';
import { SkipThrottle, Throttle } from '@nestjs/throttler';
import { CurrentUser } from 'src/common/decorator/currentUser.decorator';
import { UserAfterAuth } from 'src/common/dto/user.dto';
import { CreateVideoCommand } from './command/create-video.command';
import { CommandBus, QueryBus } from '@nestjs/cqrs';
import { CreateVideoResDto, FindVideoResDto } from './dto/res.dto';
import { FindVideosQuery } from './query/find-videos.query';
import { FileInterceptor } from '@nestjs/platform-express';
import { PageResDto } from 'src/common/dto/res.dto';

@ApiBearerAuth()
@ApiTags('Video')
@ApiExtraModels(FindVideoReqDto, PageReqDto, CreateVideoCommand, FindVideoResDto, PageResDto)
@UseGuards(ThrottlerBehindProxyGuard) 
@Controller('video')
export class VideoController {
    constructor(
        private readonly videoService: VideoService,
        private commandBus: CommandBus,
        private queryBus: QueryBus,
        ){}

    @ApiConsumes('multipart/form-data')
    @ApiPostResponse(CreateVideoResDto)
    @UseInterceptors(FileInterceptor('video'))
    @Post()
    async upload(
        @UploadedFile(
            new ParseFilePipeBuilder()
                .addFileTypeValidator({
                    fileType: 'mp4',
                })
                .addMaxSizeValidator({
                    //9mb
                    maxSize: 9 * 1024 * 1024,
                })
                .build({
                    errorHttpStatusCode: HttpStatus.UNPROCESSABLE_ENTITY,
                })
        )file: Express.Multer.File,
        @Body() createVideoReqDto: CreateVideoReqDto, 
        @CurrentUser() user: UserAfterAuth): Promise<CreateVideoResDto> {
            console.log('[file] :', file);
            const { mimetype, originalname, buffer } = file;
            const extension = originalname.split('.')[1];
            const { title } = createVideoReqDto;
            const command = new CreateVideoCommand(user.id, title, mimetype, extension, buffer);
            const { id } = await this.commandBus.execute(command);
            return { id, title };
    }

    @ApiGetItemsResponse(FindVideoResDto)
    @SkipThrottle()
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
