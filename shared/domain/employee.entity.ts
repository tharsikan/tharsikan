export enum Role {
  ADMIN = 'ADMIN',
  MANAGER = 'MANAGER',
  EMPLOYEE = 'EMPLOYEE',
}

export interface Employee {
  id: string;
  cognitoId: string;
  firstName: string;
  lastName: string;
  email: string;
  role: Role;
  department: string;
  salary: number;
  avatarUrl?: string;
  createdAt: Date;
  updatedAt: Date;
}

export type CreateEmployeeInput = Omit<Employee, 'id' | 'createdAt' | 'updatedAt'>;
