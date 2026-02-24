import { APIGatewayProxyEvent } from 'aws-lambda';
import { Role } from '../../domain/employee.entity';

export class AuthorizationError extends Error {
  constructor(message: string = 'Forbidden') {
    super(message);
    this.name = 'AuthorizationError';
  }
}

export const authorize = (event: APIGatewayProxyEvent, allowedRoles: Role[]) => {
  const claims = event.requestContext.authorizer?.claims;
  
  if (!claims) {
    throw new AuthorizationError('Unauthorized: No claims found');
  }

  const userRole = claims['custom:role'] as Role;

  if (!allowedRoles.includes(userRole)) {
    throw new AuthorizationError(`Forbidden: User role ${userRole} is not allowed`);
  }

  return {
    userId: claims['sub'] as string,
    role: userRole,
  };
};
