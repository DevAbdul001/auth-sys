const request = require('supertest');
const app = require('../app');

describe('Auth API (Cookie-based)', () => {

  const createUser = () => ({
    email: `test_${Date.now()}@example.com`,
    password: 'password123'
  });

  it('should signup a new user', async () => {
    const user = createUser();

    const res = await request(app)
      .post('/api/auth/signup')
      .send(user);

    expect(res.statusCode).toBe(201);
  });

  it('should signin user and set auth cookie', async () => {
    const user = createUser();

    await request(app)
      .post('/api/auth/signup')
      .send(user);

    const res = await request(app)
      .post('/api/auth/signin')
      .send(user);

    expect(res.statusCode).toBe(200);

    // cookie should be set
    const cookies = res.headers['set-cookie'];
    expect(cookies).toBeDefined();
  });

  it('should access /me with cookie session', async () => {
    const user = createUser();
    const agent = request.agent(app);

    await agent.post('/api/auth/signup').send(user);
    await agent.post('/api/auth/signin').send(user);

    const res = await agent.get('/api/auth/me');

    expect(res.statusCode).toBe(200);
  });

  it('should refresh token using cookie session', async () => {
    const user = createUser();
    const agent = request.agent(app);

    await agent.post('/api/auth/signup').send(user);
    await agent.post('/api/auth/signin').send(user);

    const res = await agent.post('/api/auth/refresh-token');

    expect(res.statusCode).toBe(200);
    expect(res.body).toHaveProperty('success', true);
    expect(res.body).toHaveProperty('message', 'Access token refreshed');

  });

  it('should signout user and clear cookie', async () => {
    const user = createUser();
    const agent = request.agent(app);

    await agent.post('/api/auth/signup').send(user);
    await agent.post('/api/auth/signin').send(user);

    const res = await agent.post('/api/auth/signout');

    expect(res.statusCode).toBe(200);
  });

  it('should delete user account while authenticated', async () => {
    const user = createUser();
    const agent = request.agent(app);

    await agent.post('/api/auth/signup').send(user);
    await agent.post('/api/auth/signin').send(user);

    const res = await agent.delete('/api/auth/delete');

    expect(res.statusCode).toBe(200);
  });

  it('should reject access to /me without auth cookie', async () => {
    const res = await request(app).get('/api/auth/me');

    expect(res.statusCode).toBe(401);
  });

});
