import { UsersService } from './users.service';
export declare class UsersController {
    private readonly usersService;
    constructor(usersService: UsersService);
    getMe(user: {
        sub?: string;
    } | null): Promise<{
        id: string;
        name: string;
        role: string;
        deleted: boolean;
    } | {
        id: string;
        name: string;
        role: string;
    }>;
    updateMe(body: Record<string, unknown>): Promise<Record<string, unknown>>;
    deleteMe(): Promise<{
        id: string;
        deleted: boolean;
    }>;
    getById(id: string): Promise<{
        id: string;
        name: string;
        role: string;
        deleted: boolean;
    } | {
        id: string;
        name: string;
        role: string;
    }>;
    getAll(): Promise<{
        id: string;
        name: string;
        role: string;
        deleted: boolean;
    }[]>;
}
