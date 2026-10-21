// C:\sistemas\sicab\sicab-backend\src\common\exceptions\domain.exception.ts
import { BadRequestException } from '@nestjs/common';

export class DomainException extends BadRequestException {
    constructor(
        message: string,
        metadata?: Record<string, any>
    ) {
        super({
            message,
            metadata,
        });
    }
}
