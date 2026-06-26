import { PluginLoaderService } from './runtime/plugin-loader.service';
import { PluginsRepository } from './plugins.repository';
export declare class PluginsService {
    private readonly pluginsRepository;
    private readonly pluginLoaderService;
    constructor(pluginsRepository: PluginsRepository, pluginLoaderService: PluginLoaderService);
    list(): Promise<import("./plugins.repository").PluginRecord[]>;
    get(id: string): Promise<import("./plugins.repository").PluginRecord | null>;
    create(payload: Record<string, unknown>): Promise<import("./plugins.repository").PluginRecord>;
    update(id: string, payload: Record<string, unknown>): Promise<import("./plugins.repository").PluginRecord | null>;
    rescan(baseDir?: string): Promise<import("./plugins.repository").PluginRecord[]>;
    enable(id: string): Promise<import("./plugins.repository").PluginRecord | null>;
    disable(id: string): Promise<import("./plugins.repository").PluginRecord | null>;
    remove(id: string): Promise<{
        removed: boolean;
        id: string;
    }>;
}
