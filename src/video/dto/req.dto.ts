import { ApiProperty } from "@nestjs/swagger";

export class CreateVideoReqDto {
    @ApiProperty({ required: true})
    id: string;
}

export class FindVideoReqDto {
    @ApiProperty({ required: true})
    id: string;
}