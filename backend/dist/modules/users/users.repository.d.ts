import { DatabaseService } from '@/core/database/database.service';
export declare class UsersRepository {
    private readonly databaseService;
    constructor(databaseService: DatabaseService);
    private mapRow;
    findById(id: string): Promise<{
        id: string;
        name: string;
        role: string;
        deleted: boolean;
    } | {
        id: string;
        name: string;
        role: string;
    }>;
    findAll(): Promise<{
        id: string;
        name: string;
        role: string;
        deleted: boolean;
    }[]>;
    update(id: string, payload: Record<string, unknown>): Promise<Record<string, unknown>>;
    softDelete(id: string): Promise<{
        id: string;
        deleted: boolean;
    }>;
}
