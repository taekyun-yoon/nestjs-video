import { Injectable } from '@nestjs/common';

@Injectable()
export class VideoService {
    findOne(id: string) {
        return "video one";
    }
    findAll() {
        return "video list";
    }
    create() {
        return "video create";
    }

}
