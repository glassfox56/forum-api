import request from 'supertest';
import createServer from '../createServer.js';

describe('GET /health', () => {
  it('should respond with status 200 and ok status', async () => {
    const app = await createServer({});

    const response = await request(app).get('/health');

    expect(response.status).toEqual(200);
    expect(response.body.status).toEqual('ok');
  });
});
