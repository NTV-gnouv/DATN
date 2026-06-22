import { Injectable } from '@nestjs/common';

@Injectable()
export class ConfigServiceCore {
  get(key: string, fallback?: string): string | undefined {
    return process.env[key] ?? fallback;
  }
}
