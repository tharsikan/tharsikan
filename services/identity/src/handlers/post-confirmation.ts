import { PostConfirmationConfirmSignUpTriggerEvent } from 'aws-lambda';
import { drizzle } from 'drizzle-orm/node-postgres';
import { Pool } from 'pg';
import { employees } from '../../../../shared/infrastructure/database/drizzle-schema';
import { CognitoIdentityProviderClient, AdminUpdateUserAttributesCommand } from '@aws-sdk/client-cognito-identity-provider';

const pool = new Pool({ connectionString: process.env.DATABASE_URL });
const db = drizzle(pool);
const cognito = new CognitoIdentityProviderClient({});

export const handler = async (event: PostConfirmationConfirmSignUpTriggerEvent) => {
  const { sub, email, 'custom:companyId': companyId, 'custom:role': role } = event.request.userAttributes;

  // 1. Sync to RDS
  const [newUser] = await db.insert(employees).values({
    cognitoId: sub,
    email: email,
    companyId: companyId as string,
    role: (role as any) || 'EMPLOYEE',
  }).returning();

  // 2. Update Cognito with the DB UUID for faster lookups in future requests
  await cognito.send(new AdminUpdateUserAttributesCommand({
    UserPoolId: event.userPoolId,
    Username: event.userName,
    UserAttributes: [
      { Name: 'custom:db_id', Value: newUser.id }
    ]
  }));

  return event;
};
