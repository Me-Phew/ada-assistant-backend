import { HttpStatus } from '@nestjs/common';
import { BaseException } from 'common/exceptions/base.exception';

export class EmailNotVerifiedException extends BaseException {
  constructor() {
    super('Email address is not verified', HttpStatus.FORBIDDEN, {
      errorCode: 'EMAIL_NOT_VERIFIED',
    });
  }
}