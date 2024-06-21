import { BadRequestException, Body, Controller, Post } from '@nestjs/common';
import { ApiExtraModels, ApiTags } from '@nestjs/swagger';
import { AuthService } from './auth.service';
import { LoginReqDto, SignupReqDto } from './dto/req.dto';
import { Public } from 'src/common/decorator/public.decorator';
import { LoginResDto, SignupResDto } from './dto/res.dto';

@ApiTags('Auth')
@ApiExtraModels(SignupResDto, LoginResDto)
@Controller('auth')
export class AuthController {
    constructor(private authService: AuthService) {}

    @Public()
    @Post('signup')
    async signup(@Body() { email, password, passwordConfirm }: SignupReqDto): Promise<SignupResDto> {
        if(password !== passwordConfirm) throw new BadRequestException('Password and PasswordConfirm is not matched.');
        const { id } = await this.authService.signup(email, password);
        return { id };
    }

    @Public()
    @Post('login')
    async login(@Body() { email, password }: LoginReqDto): Promise<LoginResDto> {
        return this.authService.login(email, password);
    }
}
