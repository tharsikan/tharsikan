import express from 'express';
import { handler as identityHandler } from './services/identity/src/handlers/post-confirmation.ts';
import { handler as employeeHandler } from './services/employee/src/handlers/employee.ts';
import { handler as workflowHandler } from './services/attendance-leave/src/handlers/workflow.ts';
import { APIGatewayProxyEvent, Context } from 'aws-lambda';

const app = express();
app.use(express.json());

const lambdaToExpress = (handler: any) => async (req: express.Request, res: express.Response) => {
  const event: Partial<APIGatewayProxyEvent> = {
    body: JSON.stringify(req.body),
    path: req.path,
    httpMethod: req.method,
    queryStringParameters: req.query as any,
    pathParameters: req.params as any,
    headers: req.headers as any,
    requestContext: {
      identity: { sourceIp: '127.0.0.1' },
      authorizer: {
        claims: {
          'sub': 'dev-cognito-id',
          'custom:db_id': '00000000-0000-0000-0000-000000000001',
          'custom:companyId': '11111111-1111-1111-1111-111111111111',
          'custom:role': req.headers['x-dev-role'] || 'ADMIN'
        }
      }
    } as any
  };

  try {
    const result = await handler(event as APIGatewayProxyEvent, {} as Context);
    res.status(result.statusCode).set(result.headers).send(result.body);
  } catch (error: any) {
    res.status(500).json({ message: error.message });
  }
};

// Routes
app.all('/employees*', lambdaToExpress(employeeHandler));
app.all('/attendance*', lambdaToExpress(workflowHandler));
app.all('/leave*', lambdaToExpress(workflowHandler));

const PORT = 3000;
app.listen(PORT, '0.0.0.0', () => {
  console.log(`betterHR Multi-tenant Dev Server running on http://localhost:${PORT}`);
  console.log('Use header "x-dev-role" to switch between ADMIN, HR, EMPLOYEE');
});
