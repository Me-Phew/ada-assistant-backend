import { Device } from 'database/schema/devices';
import { User } from 'database/schema/users';

declare global {
  namespace Express {
    interface Request {
      user: User;
      device: Device;
    }
  }
}
