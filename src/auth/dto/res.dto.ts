import { ApiProperty } from '@nestjs/swagger';

export class SignupResDto {
    @ApiProperty({ required: true })
    id: string;
}

export class LoginResDto {
    @ApiProperty({ required: true })
    accessToken: string;
}

export class RefreshResDto {
    @ApiProperty({ required: true })
    accessToken: string;
}
