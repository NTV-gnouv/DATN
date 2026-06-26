import type { ExecuteValues } from 'mysql2/promise';
type SqlRunner = (sql: string, params?: ExecuteValues) => Promise<unknown>;
export declare function persistSubmissionFields(run: SqlRunner, submissionId: string, formId: string, payload: Record<string, unknown>): Promise<void>;
export {};
