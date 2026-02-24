import { Employee, CreateEmployeeInput } from './employee.entity';

export interface EmployeeRepository {
  create(employee: CreateEmployeeInput): Promise<Employee>;
  findById(id: string): Promise<Employee | null>;
  findByEmail(email: string): Promise<Employee | null>;
  update(id: string, employee: Partial<Employee>): Promise<Employee>;
  delete(id: string): Promise<void>;
}
