import { ApiProperty } from "@nestjs/swagger";

export class CreateVideoReqDto {
    @ApiProperty({ required: true})
    title: string;
    
    @ApiProperty({ required: true})
    video: string;
}

export class FindVideoReqDto {
    @ApiProperty({ required: true})
    id: string;
}