export type UserRole = 'Employee' | 'Manager' | 'Admin';
export type ApprovalStatus = 'Active' | 'PendingApproval' | 'Rejected';

export interface ProblemDetails {
  type?: string;
  title?: string;
  status?: number;
  detail?: string;
  errors?: Record<string, string[]>;
}

export interface PaginatedResult<T> {
  items: T[];
  totalCount: number;
  page: number;
  pageSize: number;
  totalPages: number;
}

export interface DepartmentOption {
  id: string;
  name: string;
  description?: string;
}

export interface JobRoleOption {
  id: string;
  title: string;
  departmentId: string;
  departmentName: string;
  description?: string;
}
