import { ConfigService } from '@nestjs/config';
import { PlatformInsightsContextService } from './platform-insights-context.service';
import type { PlatformInsightsChatInput } from './platform-insights.types';
export declare class PlatformInsightsChatService {
    private readonly configService;
    private readonly contextService;
    private readonly logger;
    constructor(configService: ConfigService, contextService: PlatformInsightsContextService);
    chat(input: PlatformInsightsChatInput): Promise<{
        reply: string;
        grounded: boolean;
        usedModel: string;
    }>;
    private buildFallbackReply;
}
