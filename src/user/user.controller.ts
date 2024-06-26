import { Controller, Get, Param, Query, UseGuards } from '@nestjs/common';
import { ApiBearerAuth, ApiExtraModels, ApiTags } from '@nestjs/swagger';
import { FindUserResDto } from './dto/res.dto';
import { PageReqDto } from 'src/common/dto/req.dto';
import { FindUserReqDto } from './dto/req.dto';
import { PageResDto } from 'src/common/dto/res.dto';
import { UserService } from './user.service';
import { ApiGetItemsResponse, ApiGetResponse } from 'src/common/decorator/swagger.decorator';

@ApiTags('User')
@ApiExtraModels(FindUserResDto, PageReqDto, PageResDto, FindUserReqDto)
@Controller('user')
export class UserController {
    constructor(private readonly userService: UserService){}

    @ApiBearerAuth()
    @ApiGetItemsResponse(FindUserResDto)
    @Get()
    async findAll(@Query() { page, size }: PageReqDto): Promise<{ items: FindUserResDto[] }> {
        const users = await this.userService.findAll(page, size);
        return { items: users.map((user) => FindUserResDto.toDto(user)) };
    }

    @ApiBearerAuth()
    @ApiGetResponse(FindUserResDto)
    @Get(':id')
    async findUser(@Param() { id }: FindUserReqDto): Promise<FindUserResDto> {
        const user = await this.userService.findUser(id);
        return FindUserResDto.toDto(user);
    }
}
