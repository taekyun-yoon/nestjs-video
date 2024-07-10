import { Injectable } from "@nestjs/common";
import { EventsHandler, IEventHandler } from "@nestjs/cqrs";
import { VideoCreatedEvent } from "./event/video-created.event";

@Injectable()
@EventsHandler(VideoCreatedEvent)
export class VideoCreatedHandler implements IEventHandler<VideoCreatedEvent> {
    handle(event: VideoCreatedEvent) {
        console.log(`Video created(id: ${event.id})`);
    }
}  