export type UserRole = 'patient' | 'manager';

export interface UserProfile {
  readonly id: string;
  readonly role: UserRole;
  readonly fullName: string;
  readonly phone: string;
  readonly email: string;
  readonly createdAt: string;
  readonly updatedAt: string;
}
