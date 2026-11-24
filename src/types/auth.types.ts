import type { ApprovalStatus, UserRole } from './common.types';

export interface AuthUser {
  id: string;
  fullName: string;
  email: string;
  employeeCode: string;
  avatarInitials: string;
  role: UserRole;
  approvalStatus: ApprovalStatus;
  jobTitle?: string;
  departmentId?: string;
  departmentName?: string;
  targetRoleId?: string;
  targetRoleTitle?: string;
  batchLabel?: string;
  phoneNumber?: string;
  location?: string;
  companyName?: string;
  twoFactorEnabled: boolean;
}

export interface AuthResponse {
  accessToken: string;
  refreshToken: string;
  expiresAtUtc: string;
  user: AuthUser;
}

export interface LoginRequest {
  email: string;
  password: string;
  expectedRole?: 'Employee' | 'Manager';
  rememberMe?: boolean;
}

export interface EmployeeRegisterRequest {
  fullName: string;
  email: string;
  password: string;
  companyName?: string;
}

export interface ManagerRegisterRequest {
  fullName: string;
  email: string;
  password: string;
  companyName?: string;
  invitationCode?: string;
}

export interface ManagerRegisterResult {
  requiresAdminApproval: boolean;
  message: string;
  auth?: AuthResponse;
}

export interface ManagerRequestDto {
  id: string;
  fullName: string;
  email: string;
  companyName?: string;
  approvalStatus: ApprovalStatus;
  createdAtUtc: string;
}

export interface ManagerInvitationDto {
  id: string;
  email: string;
  invitationCode: string;
  departmentName?: string;
  expiresAtUtc: string;
  isUsed: boolean;
  isRevoked: boolean;
}
