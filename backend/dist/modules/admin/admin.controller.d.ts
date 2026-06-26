import { AdminService } from './admin.service';
export declare class AdminController {
    private readonly adminService;
    constructor(adminService: AdminService);
    list(): Promise<never[]>;
    get(id: string): Promise<{
        id: string;
    }>;
    create(body: Record<string, unknown>): Promise<{
        id: string;
    }>;
    update(id: string, body: Record<string, unknown>): Promise<{
        id: string;
    }>;
}
