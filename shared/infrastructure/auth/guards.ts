import { APIGatewayProxyEvent } from 'aws-lambda';

export enum Role {
  ADMIN = 'ADMIN',
  HR = 'HR',
  EMPLOYEE = 'EMPLOYEE',
}

export interface AuthContext {
  userId: string;
  cognitoId: string;
  companyId: string;
  role: Role;
}

export class SecurityError extends Error {
  constructor(public statusCode: number, message: string) {
    super(message);
    this.name = 'SecurityError';
  }
}

export const getAuthContext = (event: APIGatewayProxyEvent): AuthContext => {
  const claims = event.requestContext.authorizer?.claims;
  
  if (!claims) {
    throw new SecurityError(401, 'Unauthorized: Missing authentication claims');
  }

  return {
    userId: claims['custom:db_id'] as string, // We'll store the DB UUID in Cognito for speed
    cognitoId: claims['sub'] as string,
    companyId: claims['custom:companyId'] as string,
    role: claims['custom:role'] as Role,
  };
};

export const authorize = (context: AuthContext, allowedRoles: Role[]) => {
  if (!allowedRoles.includes(context.role)) {
    throw new SecurityError(403, `Forbidden: ${context.role} role is not authorized for this action`);
  }
};
