import { CreatedAt, UpdatedAt } from './common/datetime';
import { Generated, Insertable, Selectable, Updateable } from 'kysely';

export interface FirmwareVersionTable {
  id: Generated<string>;
  version: string;
  releaseNotes: string;
  codename: string;
  releaseUrl: string;
  createdAt: CreatedAt;
  updatedAt: UpdatedAt;
}

export type FirmwareVersion = Selectable<FirmwareVersionTable>;
export type FirmwareVersionCreate = Insertable<FirmwareVersionTable>;
export type FirmwareVersionUpdate = Updateable<FirmwareVersionTable>;