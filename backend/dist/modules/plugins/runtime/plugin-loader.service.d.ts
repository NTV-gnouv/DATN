import { PluginRecord, PluginsRepository } from '../plugins.repository';
export declare class PluginLoaderService {
    private readonly pluginsRepository;
    private readonly logger;
    constructor(pluginsRepository: PluginsRepository);
    scanAndLoad(baseDir?: string): Promise<PluginRecord[]>;
    private findManifests;
}
