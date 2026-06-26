import { CallHandler, ExecutionContext, NestInterceptor } from '@nestjs/common';
import { Observable } from 'rxjs';
export declare class ResponseInterceptor<T> implements NestInterceptor<T, {
    success: boolean;
    data: T;
    timestamp: string;
}> {
    intercept(_context: ExecutionContext, next: CallHandler<T>): Observable<{
        success: boolean;
        data: T;
        timestamp: string;
    }>;
}
