import { Injectable } from '@nestjs/common';
import * as crypto from 'crypto';
import { DatabaseService } from 'database/database.service';
import { DB } from 'database/schema/db';
import { withTimestamps } from 'database/utils/datetime';
import { Kysely } from 'kysely';
import { generateSerialNumber } from 'utils/serial-number';
import { getUUIDV4 } from 'utils/uuid';

@Injectable()
export class DeviceRepository {
  private readonly db: Kysely<DB>;

  constructor(private readonly dbService: DatabaseService) {
    this.db = this.dbService.getDB();
  }

  async createDevice(data: {
    userId?: string;
    name: string;
    model: string;
    factoryFirmwareVersionId: string;
    boardRevision: string;
  }) {
    const id = getUUIDV4();
    const serialNumber = generateSerialNumber();

    const insertable = withTimestamps({
      id,
      ...data,
      factory_firmware_version: data.factoryFirmwareVersionId,
      current_firmware_version: data.factoryFirmwareVersionId,
      serial_number: serialNumber,
      board_revision: data.boardRevision,
    });

    delete insertable.factoryFirmwareVersionId;
    delete insertable.boardRevision;

    const result = await this.db
      .insertInto('devices')
      .values(insertable)
      .returningAll()
      .executeTakeFirst();

    return result;
  }

  async getAllDevices() {
    return this.db
      .selectFrom('devices')
      .leftJoin('users', 'users.id', 'devices.userId')
      .leftJoin(
        'firmwareVersions as factory',
        'factory.id',
        'devices.factory_firmware_version',
      )
      .leftJoin(
        'firmwareVersions as current',
        'current.id',
        'devices.current_firmware_version',
      )
      .select([
        'devices.id',
        'devices.name',
        'devices.model',
        'devices.serial_number',
        'devices.board_revision',
        'devices.lastSeen',
        'devices.createdAt',
        'users.email as userEmail',
        'factory.version as factoryVersion',
        'current.version as currentVersion',
      ])
      .orderBy('devices.createdAt', 'desc')
      .execute();
  }

  async getDeviceById(id: string) {
    return this.db
      .selectFrom('devices')
      .where('devices.id', '=', id)
      .selectAll()
      .executeTakeFirst();
  }

  async getDeviceBySerialNumber(serialNumber: string) {
    return this.db
      .selectFrom('devices')
      .where('devices.serial_number', '=', serialNumber)
      .selectAll()
      .executeTakeFirst();
  }

  async deleteDevice(id: string): Promise<boolean> {
    const result = await this.db
      .deleteFrom('devices')
      .where('id', '=', id)
      .execute();

    return result.length > 0;
  }

  async getUserDevices(userId: string) {
    return this.db
      .selectFrom('devices')
      .where('devices.userId', '=', userId)
      .leftJoin(
        'firmwareVersions as factory',
        'factory.id',
        'devices.factory_firmware_version',
      )
      .leftJoin(
        'firmwareVersions as current',
        'current.id',
        'devices.current_firmware_version',
      )
      .select([
        'devices.id',
        'devices.name',
        'devices.model',
        'devices.serial_number',
        'devices.board_revision',
        'devices.lastSeen',
        'devices.createdAt',
        'factory.version as factoryVersion',
        'current.version as currentVersion',
      ])
      .orderBy('devices.createdAt', 'desc')
      .execute();
  }

  async getUserDeviceById(deviceId: string, userId: string) {
    return this.db
      .selectFrom('devices')
      .where('devices.id', '=', deviceId)
      .where('devices.userId', '=', userId)
      .leftJoin(
        'firmwareVersions as factory',
        'factory.id',
        'devices.factory_firmware_version',
      )
      .leftJoin(
        'firmwareVersions as current',
        'current.id',
        'devices.current_firmware_version',
      )
      .select([
        'devices.id',
        'devices.name',
        'devices.model',
        'devices.serial_number',
        'devices.board_revision',
        'devices.lastSeen',
        'devices.createdAt',
        'factory.version as factoryVersion',
        'current.version as currentVersion',
      ])
      .executeTakeFirst();
  }

  async pairDeviceWithUser(serialNumber: string, userId: string) {
    const result = await this.db
      .updateTable('devices')
      .set({ userId })
      .where('serial_number', '=', serialNumber)
      .returningAll()
      .executeTakeFirst();

    return result;
  }

  async createPairingToken(serialNumber: string) {
    const token = crypto.randomBytes(16).toString('hex');
    const pairedAt = new Date();

    await this.db
      .updateTable('devices')
      .set({ pairingToken: token })
      .set('pairedAt', pairedAt)
      .where('serial_number', '=', serialNumber)
      .execute();

    return {
      token,
      pairedAt,
    };
  }

  async getDeviceByPairingToken(token: string) {
    return this.db
      .selectFrom('devices')
      .where('devices.pairingToken', '=', token)
      .selectAll()
      .executeTakeFirst();
  }
}
