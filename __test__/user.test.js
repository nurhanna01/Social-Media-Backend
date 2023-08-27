// NOTES:
// Before running unit tests, please to follow the Supertest guidelines consistently.
// Uncomment import model user in UserController
// It helps to maintain a clean separation between  production and testing environments.

import request from 'supertest';
import app_test from './app_mock.js';
import { user } from './db_mock.js';
describe('test', () => {
  beforeAll(async () => {
    try {
      // Seed initial data for testing
      const testUser = await user.create({
        username: 'testuser',
        password: 'testpassword',
        email: 'test@gmail.com',
      });
    } catch (error) {
      console.error(error.message);
      if (error.errors) {
        error.errors.forEach((err) => {
          console.error(err.message);
        });
      }
    }
  });
  afterAll(async () => {});

  // +++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++
  // USER REGISTER
  // +++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++

  it('should send status success if username, password, and email are sent', async () => {
    const newUser = {
      username: 'hanna',
      password: '123',
      email: 'hanna@example.com',
    };
    const response = await request(app_test).post('/api/user/register').send(newUser).set('Accept', 'application/json');
    expect(response.body.status).toEqual('success');
    expect(response.body.statusCode).toEqual(201);
    expect(response.body.message).toEqual('User created successfully');
    expect(response.body.data.username).toEqual(newUser.username);
    expect(response.body.data.email).toEqual(newUser.email);
  });

  it('should send error if email is already used', async () => {
    const response = await request(app_test)
      .post('/api/user/register')
      .send({ username: 'username', password: '123', email: 'test@gmail.com' })
      .set('Accept', 'application/json');
    expect(response.body.status).toEqual('error');
    expect(response.body.statusCode).toEqual(400);
    expect(response.body.message).toEqual('Email already used');
  });

  it('should send error if username is already used', async () => {
    const response = await request(app_test)
      .post('/api/user/register')
      .send({ username: 'testuser', password: '123', email: 'tes@example.com' })
      .set('Accept', 'application/json');
    expect(response.body.status).toEqual('error');
    expect(response.body.statusCode).toEqual(400);
    expect(response.body.message).toEqual('Username already exists');
  });

  it('should return wsername cannt be empty', async () => {
    const response = await request(app_test).post('/api/user/register').send({}).set('Accept', 'application/json');
    expect(response.body.status).toEqual('error');
    expect(response.body.statusCode).toEqual(400);
    expect(response.body.message).toEqual('Username cannot be empty');
  });

  // +++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++
  // USER LOGIN
  // +++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++
  it('should return success login', async () => {
    const userLogin = {
      username: 'hanna',
      password: '123',
    };
    const response = await request(app_test).post('/api/user/login').send(userLogin).set('Accept', 'application/json');
    expect(response.body.status).toEqual('success');
    expect(response.body.statusCode).toEqual(200);
    expect(response.body.message).toEqual('User logged in successfully');
  });

  it('should return failed to login because wrong password', async () => {
    const userLogin = {
      username: 'hanna',
      password: '123456',
    };
    const response = await request(app_test).post('/api/user/login').send(userLogin).set('Accept', 'application/json');
    expect(response.body.status).toEqual('error');
    expect(response.body.statusCode).toEqual(404);
    expect(response.body.message).toEqual('Wrong Password');
  });

  it('should return failed to login because username not registered', async () => {
    const userLogin = {
      username: 'han',
      password: '123',
    };
    const response = await request(app_test).post('/api/user/login').send(userLogin).set('Accept', 'application/json');
    expect(response.body.status).toEqual('error');
    expect(response.body.statusCode).toEqual(404);
    expect(response.body.message).toEqual('Username incorrect');
  });
});
