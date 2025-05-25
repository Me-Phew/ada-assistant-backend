import { SetMetadata } from '@nestjs/common';

export const NON_PAIRED_DEVICE_KEY = 'nonPairedDevice';
export const NonPairedDevice = () => SetMetadata(NON_PAIRED_DEVICE_KEY, true);
