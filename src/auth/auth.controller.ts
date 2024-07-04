import { BadRequestException, Body, Controller, Headers, Post, Req, Res } from '@nestjs/common';
import { ApiBearerAuth, ApiCreatedResponse, ApiExtraModels, ApiTags } from '@nestjs/swagger';
import { AuthService } from './auth.service';
import { LoginReqDto, SignupReqDto } from './dto/req.dto';
import { Public } from 'src/common/decorator/public.decorator';
import { LoginResDto, RefreshResDto, SignupResDto } from './dto/res.dto';
import { ApiGetResponse, ApiPostResponse } from 'src/common/decorator/swagger.decorator';
import { Request, Response } from 'express';

@ApiTags('Auth')
@ApiExtraModels(SignupResDto, LoginResDto, RefreshResDto)
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

            const { accessToken, refreshToken } = await this.authService.login(email, password, userAgent, ipAddress);
            
            res.cookie('refreshToken', refreshToken, { 
                httpOnly: true, 
                secure: false, 
                maxAge: 7 * 24 * 60 * 60 * 1000 });
                
            res.status(201).json({
                'accessToken': accessToken
            });
    }

    @Public()
    @ApiPostResponse(RefreshResDto)
    @Post('refresh')
    async refresh(
        @Req() req: Request,
        @Res({ passthrough: true }) res: Response
    ) {req.cookies
        const token = req.cookies['refreshToken'];
        const { newAccessToken, newRefreshToken } = await this.authService.refresh(token);
        
        res.cookie('refreshToken', newRefreshToken, { 
            httpOnly: true, 
            secure: false, 
            maxAge: 7 * 24 * 60 * 60 * 1000 });
        return { accessToken: newAccessToken };
    }
}
