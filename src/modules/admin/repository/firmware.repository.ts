import { Injectable } from '@nestjs/common';
import { DatabaseService } from 'database/database.service';
import { Kysely } from 'kysely';
import { DB } from 'database/schema/db';
import { withTimestamps } from 'database/utils/datetime';
import { getUUIDV4 } from 'utils/uuid';

@Injectable()
export class FirmwareRepository {
  private readonly db: Kysely<DB>;

  constructor(private readonly dbService: DatabaseService) {
    this.db = this.dbService.getDB();
  }

  async createFirmware(data: {
    version: string;
    releaseNotes: string;
    codename: string;
    releaseUrl: string;
  }) {
    const id = getUUIDV4();

    const insertable = withTimestamps({
      id,
      ...data,
    });

    const result = await this.db
      .insertInto('firmwareVersions')
      .values(insertable)
      .returningAll()
      .executeTakeFirst();

    return result;
  }

  async getAllFirmwareVersions() {
    return this.db
      .selectFrom('firmwareVersions')
      .selectAll()
      .orderBy('createdAt', 'desc')
      .execute();
  }

  async getFirmwareById(id: string) {
    return this.db
      .selectFrom('firmwareVersions')
      .where('id', '=', id)
      .selectAll()
      .executeTakeFirst();
  }

  async deleteFirmware(id: string): Promise<boolean> {
    const result = await this.db
      .deleteFrom('firmwareVersions')
      .where('id', '=', id)
      .execute();
    
    return result.length > 0;
  }
}