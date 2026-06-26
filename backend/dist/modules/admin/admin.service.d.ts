import { AdminRepository } from './admin.repository';
export declare class AdminService {
    private readonly adminRepository;
    constructor(adminRepository: AdminRepository);
    list(): Promise<never[]>;
    get(id: string): Promise<{
        id: string;
    }>;
    create(payload: Record<string, unknown>): Promise<{
        id: string;
    }>;
    update(id: string, payload: Record<string, unknown>): Promise<{
        id: string;
    }>;
}
