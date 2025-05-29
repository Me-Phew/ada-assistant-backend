import { applyDecorators } from '@nestjs/common';
import { ValidationException } from '../exceptions/validation.exception';
import { TemplatedApiException } from './templated-api-exception.decorator';

export function ApiValidationException() {
  return applyDecorators(
    TemplatedApiException(() => new ValidationException([]), {
      description: 'Validation Failed',
    }),
  );
}
