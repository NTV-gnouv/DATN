import { AiBackgroundService } from './ai-background.service';
import { GenerateAiBackgroundDto } from './dto/generate-ai-background.dto';
export declare class AiBackgroundController {
    private readonly aiBackgroundService;
    constructor(aiBackgroundService: AiBackgroundService);
    generate(body: GenerateAiBackgroundDto): Promise<{
        imageUrl: string;
        prompt: string;
        model: string;
    }>;
}
