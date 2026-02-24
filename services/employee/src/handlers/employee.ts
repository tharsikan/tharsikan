import { APIGatewayProxyEvent, APIGatewayProxyResult } from 'aws-lambda';
import { drizzle } from 'drizzle-orm/node-postgres';
// @ts-ignore
import pg from 'pg';
const { Pool } = pg;
import { employees } from '../../../../shared/infrastructure/database/drizzle-schema.js';
import { eq, and } from 'drizzle-orm';
import { getAuthContext, authorize, Role } from '../../../../shared/infrastructure/auth/guards.js';

const pool = new Pool({ connectionString: process.env.DATABASE_URL });
const db = drizzle(pool);

async function handler(event: APIGatewayProxyEvent): Promise<APIGatewayProxyResult> {
  try {
    const auth = getAuthContext(event);
    const method = event.httpMethod;
    const path = event.path;

    // GET /employees - Scoped by company_id
    if (path === '/employees' && method === 'GET') {
      authorize(auth, [Role.ADMIN, Role.HR]);
      const result = await db.select().from(employees).where(eq(employees.companyId, auth.companyId));
      return { statusCode: 200, body: JSON.stringify(result) };
    }

    // PATCH /employees/{id}/promote - Admin only
    if (path.match(/\/employees\/.*\/promote/) && method === 'PATCH') {
      authorize(auth, [Role.ADMIN]);
      const targetId = event.pathParameters?.id;
      
      const [updated] = await db.update(employees)
        .set({ role: 'HR' })
        .where(and(
          eq(employees.id, targetId!),
          eq(employees.companyId, auth.companyId) // Isolation check
        ))
        .returning();

      return { statusCode: 200, body: JSON.stringify(updated) };
    }

    return { statusCode: 404, body: JSON.stringify({ message: 'Not Found' }) };
  } catch (error: any) {
    return {
      statusCode: error.statusCode || 500,
      body: JSON.stringify({ message: error.message }),
    };
  }
}

export { handler };
