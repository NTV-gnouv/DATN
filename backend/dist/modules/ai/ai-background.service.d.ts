import { ConfigService } from '@nestjs/config';
import { MediaService } from '@/modules/media/media.service';
export declare class AiBackgroundService {
    private readonly configService;
    private readonly mediaService;
    private readonly logger;
    constructor(configService: ConfigService, mediaService: MediaService);
    generateBackground(prompt: string, ownerId: string): Promise<{
        imageUrl: string;
        prompt: string;
        model: string;
    }>;
    private buildBackgroundPrompt;
}
