import { APIGatewayProxyEvent, APIGatewayProxyResult } from 'aws-lambda';
import { drizzle } from 'drizzle-orm/node-postgres';
import { Pool } from 'pg';
import { attendance, leaves } from '../../../../shared/infrastructure/database/drizzle-schema';
import { eq, and } from 'drizzle-orm';
import { getAuthContext, authorize, Role } from '../../../../shared/infrastructure/auth/guards';

const pool = new Pool({ connectionString: process.env.DATABASE_URL });
const db = drizzle(pool);

export const handler = async (event: APIGatewayProxyEvent): Promise<APIGatewayProxyResult> => {
  try {
    const auth = getAuthContext(event);
    const path = event.path;

    // POST /attendance/clock-in
    if (path === '/attendance/clock-in') {
      const result = await db.insert(attendance).values({
        companyId: auth.companyId,
        userId: auth.userId,
        clockIn: new Date(),
        metadata: { ip: event.requestContext.identity.sourceIp }
      }).returning();
      return { statusCode: 201, body: JSON.stringify(result) };
    }

    // POST /leave/apply
    if (path === '/leave/apply') {
      const body = JSON.parse(event.body || '{}');
      const result = await db.insert(leaves).values({
        companyId: auth.companyId,
        userId: auth.userId,
        startDate: new Date(body.startDate),
        endDate: new Date(body.endDate),
        type: body.type,
        reason: body.reason,
        status: 'PENDING'
      }).returning();
      return { statusCode: 201, body: JSON.stringify(result) };
    }

    // PATCH /leave/{id}/approve - HR/Admin only
    if (path.match(/\/leave\/.*\/approve/) && event.httpMethod === 'PATCH') {
      authorize(auth, [Role.ADMIN, Role.HR]);
      const leaveId = event.pathParameters?.id;
      
      const [updated] = await db.update(leaves)
        .set({ status: 'APPROVED', approvedBy: auth.userId })
        .where(and(
          eq(leaves.id, leaveId!),
          eq(leaves.companyId, auth.companyId)
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
};
