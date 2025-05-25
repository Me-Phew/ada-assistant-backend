import { IsNotEmpty, IsUUID } from 'class-validator';

/**
 * Pair Dto
 *
 * @export
 * @class PairDto
 */
export class PairDto {
  /**
   * Device Serial Number
   *
   * @example ADA-5DC54-14C09
   * @type {string}
   * @memberof PairDto
   */
  @IsNotEmpty()
  serialNumber!: string;

  /**
   * User Id
   *
   * @example 69fdfad2-18c5-4498-b570-ee833c4b0d8f
   * @type {string}
   * @memberof PairDto
   */
  @IsUUID()
  @IsNotEmpty()
  userId!: string;
}
