import { UsersRepository } from './users.repository';
export declare class UsersService {
    private readonly usersRepository;
    constructor(usersRepository: UsersRepository);
    getMe(userId: string): Promise<{
        id: string;
        name: string;
        role: string;
        deleted: boolean;
    } | {
        id: string;
        name: string;
        role: string;
    }>;
    updateMe(payload: Record<string, unknown>): Promise<Record<string, unknown>>;
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
