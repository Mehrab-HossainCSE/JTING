export interface UserManage {
  id: number;
  userName: string;
  email: string;
  fullName: string;
  roleName: string;
  departmentId: string;
  active: boolean;
  password?: string;
  confirmPassword?: string;
}

export interface UpdatePasswordRequest {
  id: number;
  password: string;
  confirmPassword: string;
}
