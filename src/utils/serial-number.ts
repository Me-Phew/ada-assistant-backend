import { v4 as uuidv4 } from 'uuid';

/**
 * Generates a unique device serial number in the format ADA-XXXXX-XXXXX
 * @returns {string} A formatted serial number
 */
export function generateSerialNumber(): string {
  const uuid = uuidv4().replace(/-/g, '');
  
  const part1 = uuid.substring(0, 5).toUpperCase();
  const part2 = uuid.substring(5, 10).toUpperCase();
  
  return `ADA-${part1}-${part2}`;
}