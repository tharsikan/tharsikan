import { APIGatewayProxyEvent, APIGatewayProxyResult } from 'aws-lambda';
import { Logger } from '@aws-lambda-powertools/logger';
import { drizzle } from 'drizzle-orm/node-postgres';
import { Pool } from 'pg';
import { EmployeeUseCase } from '../use-cases/employee.use-case';
import { PostgresEmployeeRepository } from '../../../../shared/infrastructure/database/postgres-employee-repository';
import { authorize } from '../../../../shared/infrastructure/auth/authorizer';
import { Role } from '../../../../shared/domain/employee.entity';

const logger = new Logger();
const pool = new Pool({ connectionString: process.env.DATABASE_URL });
const db = drizzle(pool);
const repository = new PostgresEmployeeRepository(db);
const useCase = new EmployeeUseCase(db);

export const handler = async (event: APIGatewayProxyEvent): Promise<APIGatewayProxyResult> => {
  const path = event.path;
  const method = event.httpMethod;

  try {
    if (path === '/employees' && method === 'GET') {
      authorize(event, [Role.EMPLOYEE, Role.MANAGER, Role.ADMIN]);
      const dept = event.queryStringParameters?.dept;
      const result = await useCase.listEmployees({ department: dept });
      return { statusCode: 200, body: JSON.stringify(result) };
    }

    if (path.startsWith('/employees/') && method === 'GET' && !path.endsWith('/org-chart')) {
      authorize(event, [Role.EMPLOYEE, Role.MANAGER, Role.ADMIN]);
      const id = event.pathParameters?.id;
      const employee = await repository.findById(id!);
      return employee 
        ? { statusCode: 200, body: JSON.stringify(employee) }
        : { statusCode: 404, body: JSON.stringify({ message: 'Not Found' }) };
    }

    if (path === '/employees' && method === 'POST') {
      authorize(event, [Role.ADMIN]);
      const input = JSON.parse(event.body || '{}');
      const result = await repository.create(input);
      return { statusCode: 201, body: JSON.stringify(result) };
    }

    if (path.endsWith('/org-chart')) {
      authorize(event, [Role.EMPLOYEE, Role.MANAGER, Role.ADMIN]);
      const id = event.pathParameters?.id;
      const chart = await useCase.getOrgChart(id!);
      return { statusCode: 200, body: JSON.stringify(chart) };
    }

    return { statusCode: 404, body: JSON.stringify({ message: 'Not Found' }) };
  } catch (error: any) {
    logger.error('Employee Service Error', error);
    return {
      statusCode: error.name === 'AuthorizationError' ? 403 : 400,
      body: JSON.stringify({ message: error.message }),
    };
  }
};
