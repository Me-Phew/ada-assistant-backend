import { createParamDecorator, ExecutionContext } from '@nestjs/common';
import { getRequest } from 'common/graphql/context';

export const CurrentDevice = createParamDecorator(
  (data: unknown, ctx: ExecutionContext) => {
    const request = getRequest(ctx);
    return request.device;
  },
);
