import { UserRole } from '../../../common/constants/roles.enum';

export class UserSidebarDto {
  id: string;
  firstName: string;
  lastName: string;
  email: string;
  role: UserRole;
  hasProfile: boolean; // Indica el tipo de perfil que tiene
  profileId: string | null; // ID del perfil si existe
  
  get fullName(): string {
    return `${this.firstName} ${this.lastName}`;
  }

  constructor(partial: Partial<UserSidebarDto>) {
    Object.assign(this, partial);
  }
}