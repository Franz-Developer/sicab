// C:\sistemas\sicab\sicab-backend\src\common\decorators\get-user.decorator.ts
import { createParamDecorator, ExecutionContext } from '@nestjs/common';

export const GetUser = createParamDecorator(
    (_data, ctx: ExecutionContext) => {
        const request = ctx.switchToHttp().getRequest();
        const user = request.user;

        return {
            id: user.usuario_id ?? user.sub ?? null,
            ...user,
        };
    },
);
