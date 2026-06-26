import { ThemeRecord, ThemesRepository } from '../themes.repository';
export declare class ThemeLoaderService {
    private readonly themesRepository;
    private readonly logger;
    constructor(themesRepository: ThemesRepository);
    scanAndLoad(baseDir?: string): Promise<ThemeRecord[]>;
    private findManifests;
}
