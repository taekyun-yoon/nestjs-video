import { Controller, Get, Param, Query, UseGuards, Post } from '@nestjs/common';
import { ApiBearerAuth, ApiExtraModels, ApiTags } from '@nestjs/swagger';
import { FindUserResDto } from './dto/res.dto';
import { PageReqDto } from 'src/common/dto/req.dto';
import { FindUserReqDto } from './dto/req.dto';
import { PageResDto } from 'src/common/dto/res.dto';
import { UserService } from './user.service';
import { ApiGetItemsResponse, ApiGetResponse } from 'src/common/decorator/swagger.decorator';
import { Roles } from 'src/common/decorator/role.decorator';
import { UserRole } from './enum/user.enum';
import { Public } from 'src/common/decorator/public.decorator';

@ApiTags('User')
@ApiExtraModels(FindUserResDto, PageReqDto, PageResDto, FindUserReqDto)
@Controller('user')
export class UserController {
    constructor(private readonly userService: UserService){}

    @ApiBearerAuth()
    @ApiGetItemsResponse(FindUserResDto)
    @Get()
    @Roles(UserRole.Admin)
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

    @Public()
    @Post('bulk')
    createBulk() {
        return this.userService.createBulk();
        
    }
}
