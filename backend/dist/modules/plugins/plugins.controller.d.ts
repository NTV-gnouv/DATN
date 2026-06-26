import { PluginsService } from './plugins.service';
export declare class PluginsController {
    private readonly pluginsService;
    constructor(pluginsService: PluginsService);
    list(): Promise<import("./plugins.repository").PluginRecord[]>;
    get(id: string): Promise<import("./plugins.repository").PluginRecord | null>;
    create(body: Record<string, unknown>): Promise<import("./plugins.repository").PluginRecord>;
    update(id: string, body: Record<string, unknown>): Promise<import("./plugins.repository").PluginRecord | null>;
    rescan(): Promise<import("./plugins.repository").PluginRecord[]>;
    enable(id: string): Promise<import("./plugins.repository").PluginRecord | null>;
    disable(id: string): Promise<import("./plugins.repository").PluginRecord | null>;
    remove(id: string): Promise<{
        removed: boolean;
        id: string;
    }>;
}
