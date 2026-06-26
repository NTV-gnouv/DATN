export declare class CacheService {
    get<T>(_key: string): Promise<T | null>;
    set(_key: string, _value: unknown, _ttlSeconds?: number): Promise<void>;
}
