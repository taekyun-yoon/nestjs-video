import { ApiProperty } from "@nestjs/swagger";

export class CreateVideoResDto {
    @ApiProperty({ required: true})
    id: string;
    
    @ApiProperty({ required: true})
    title: string;
}
