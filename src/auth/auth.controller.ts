import { BadRequestException, Body, Controller, Post, Req, Res } from '@nestjs/common';
import { ApiCreatedResponse, ApiExtraModels, ApiTags } from '@nestjs/swagger';
import { AuthService } from './auth.service';
import { LoginReqDto, SignupReqDto } from './dto/req.dto';
import { Public } from 'src/common/decorator/public.decorator';
import { LoginResDto, SignupResDto } from './dto/res.dto';
import { ApiGetResponse, ApiPostResponse } from 'src/common/decorator/swagger.decorator';
import { Response } from 'express';

@ApiTags('Auth')
@ApiExtraModels(SignupResDto, LoginResDto)
@Controller('auth')
export class AuthController {
    constructor(private authService: AuthService) {}

    @Public()
    @ApiPostResponse(SignupResDto)
    @Post('signup')
    async signup(@Body() { email, password, passwordConfirm }: SignupReqDto): Promise<SignupResDto> {
        if(password !== passwordConfirm) throw new BadRequestException('Password and PasswordConfirm is not matched.');
        const { id } = await this.authService.signup(email, password);
        return { id };
    }

    @Public()
    @ApiGetResponse(LoginResDto)
    @Post('login')
    async login(
        @Body() { email, password }: LoginReqDto,
        @Res() res: Response,
        @Req() req: Request
        ): Promise<void> {
            const  userAgent = req['userAgent'] as string;
            const ipAddress = req['ipAddress'] as string;

            console.log('userAgent: ', userAgent);
            console.log('ipAddress: ', ipAddress);

            const { accessToken, refreshToken } = await this.authService.login(email, password, userAgent, ipAddress);

            res.cookie('accessToken', accessToken, { httpOnly: true });
            res.status(201).json({
                message: 'Success Login',
                accessToken: accessToken,
                refreshToken: refreshToken
            })
    }
}
