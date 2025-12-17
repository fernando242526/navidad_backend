import { UserResponseDto } from '../modules/users/dto/user-response.dto';

declare global {
  namespace Express {
    interface Request {
      user?: UserResponseDto;
    }
  }
}
