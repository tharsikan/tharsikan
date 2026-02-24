import { Employee, CreateEmployeeInput } from '../../domain/employee.entity';
import { employees } from './drizzle-schema';
import { NodePgDatabase } from 'drizzle-orm/node-postgres';
import { eq } from 'drizzle-orm';

export class PostgresEmployeeRepository {
  constructor(private db: NodePgDatabase<any>) {}

  async create(input: CreateEmployeeInput): Promise<Employee> {
    const [result] = await this.db.insert(employees).values({
      ...input,
      salary: input.salary.toString(),
    }).returning();

    return this.mapToEntity(result);
  }

  async findById(id: string): Promise<Employee | null> {
    const [result] = await this.db.select().from(employees).where(eq(employees.id, id));
    return result ? this.mapToEntity(result) : null;
  }

  async findByEmail(email: string): Promise<Employee | null> {
    const [result] = await this.db.select().from(employees).where(eq(employees.email, email));
    return result ? this.mapToEntity(result) : null;
  }

  async update(id: string, input: Partial<Employee>): Promise<Employee> {
    const [result] = await this.db.update(employees)
      .set({
        ...input,
        salary: input.salary?.toString(),
        updatedAt: new Date(),
      })
      .where(eq(employees.id, id))
      .returning();
    
    return this.mapToEntity(result);
  }

  async delete(id: string): Promise<void> {
    await this.db.delete(employees).where(eq(employees.id, id));
  }

  private mapToEntity(data: any): Employee {
    return {
      ...data,
      salary: parseFloat(data.salary),
    };
  }
}
