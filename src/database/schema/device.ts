import { Generated, Insertable, Selectable, Updateable } from 'kysely';
import { CreatedAt, UpdatedAt } from './common/datetime';

export interface DeviceTable {
  id: Generated<string>;
  userId?: string;
  name: string;
  model: string;
  factory_firmware_version: string;
  current_firmware_version: string;
  serial_number: string;
  board_revision: string;
  lastSeen?: Date;
  createdAt: CreatedAt;
  updatedAt: UpdatedAt;
  pairingToken?: string;
  pairedAt?: Date;
}

export type Device = Selectable<DeviceTable>;
export type DeviceCreate = Insertable<DeviceTable>;
export type DeviceUpdate = Updateable<DeviceTable>;
