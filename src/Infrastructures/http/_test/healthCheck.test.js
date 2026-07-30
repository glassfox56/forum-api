import request from 'supertest';
import createServer from '../createServer.js';

describe('GET /health', () => {
  it('should respond with status 200 and ok status', async () => {
    const app = await createServer({});

    const response = await request(app).get('/health');

    // NOTE: Intentionally wrong — expects 201 but server returns 200.
    // This is for demonstrating the FAILING CI scenario.
    // To make CI pass: change 201 → 200 below, then push again.
    expect(response.status).toEqual(201);
    expect(response.body.status).toEqual('ok');
  });
});
