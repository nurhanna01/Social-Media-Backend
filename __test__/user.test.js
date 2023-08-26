import { Sequelize } from 'sequelize';
import database from '../../config/database.js';
// import { user, recipe } from '../../database/db.js';
import recipeModel from '../../models/recipeModel.js';
import userModel from '../../models/userModel.js';
import app from '../../app.js';
import request from 'supertest';
describe('test', () => {
  let db;

  beforeAll(async () => {
    // Setup database connection using the configuration from database.js
    db = new Sequelize('culinary_adventures_test', database.user, database.password, {
      host: database.host,
      dialect: 'mysql',
      pool: {
        max: 5,
        min: 0,
        acquire: 30000,
        idle: 10000,
      },
    });

    try {
      // connect to the database
      await db.authenticate();
      const recipe = recipeModel(db);
      const user = userModel(db);
      // Migrate the database schema
      await db.sync({ force: true });

      // Seed initial data for testing
      // Create a user
      const testUser = await user.create({
        username: 'testuser',
        password: 'testpassword',
        email: 'test@example.com',
      });
      // Create a recipe associated with the user
      await recipe.create({ title: 'Recipe 1', user_id: testUser.id }); // Use the user's ID as the userId
    } catch (error) {
      // console.error('Unable to connect to the database:', error);
    }
  });
  afterAll(async () => {
    //   // Close the database connection
    await db.close();
  });
  // check db connection
  // it('should establish a successful database connection', async () => {
  //   try {
  //     await db.authenticate();
  //     expect(db).toBeTruthy(); // Assertion to ensure the database object exists
  //   } catch (error) {
  //     throw new Error('Unable to connect to the database: ' + error.message);
  //   }
  // });

  // // check initial user and recipedata
  // it('should check seed initial user and recipe data', async () => {
  //   // Seed initial data for testing
  //   // Assertion to check if the data has been created successfully
  //   const testUser = await user.findOne({ where: { username: 'testuser' } });
  //   const testRecipe = await recipe.findOne({ where: { title: 'Recipe 1' } });

  //   expect(testUser).toBeTruthy();
  //   expect(testRecipe).toBeTruthy();
  // });

  // +++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++
  // USER REGISTER
  // +++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++

  it('should send status success if username, password, and email are sent', async () => {
    const newUser = {
      username: 'hanna1',
      password: '123',
      email: 'hanna1@example.com',
    };
    const response = await request(app).post('/api/user/register').send(newUser).set('Accept', 'application/json');
    expect(response.body.status).toEqual('success');
    expect(response.body.statusCode).toEqual(201);
    expect(response.body.message).toEqual('User created successfully');
    expect(response.body.data.username).toEqual(newUser.username);
    expect(response.body.data.email).toEqual(newUser.email);
  });

  it('should send error if email is already used', async () => {
    const response = await request(app)
      .post('/api/user/register')
      .send({ username: 'username', password: '123', email: 'test@example.com' })
      .set('Accept', 'application/json');
    expect(response.body.status).toEqual('error');
    expect(response.body.statusCode).toEqual(400);
    expect(response.body.message).toEqual('Email already used');
  });

  it('should send error if username is already used', async () => {
    const response = await request(app)
      .post('/api/user/register')
      .send({ username: 'testuser', password: '123', email: 'tes@example.com' })
      .set('Accept', 'application/json');
    expect(response.body.status).toEqual('error');
    expect(response.body.statusCode).toEqual(400);
    expect(response.body.message).toEqual('Username already exists');
  });

  it('should send internal server error', async () => {
    const response = await request(app).post('/api/user/register').send({}).set('Accept', 'application/json');
    expect(response.body.status).toEqual('error');
    expect(response.body.statusCode).toEqual(500);
    expect(response.body.message).toEqual('Internal server error');
  });

  // +++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++
  // USER LOGIN
  // +++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++
  it('should return success login', async () => {
    const userLogin = {
      username: 'hanna',
      password: '123',
    };
    const response = await request(app).post('/api/user/login').send(userLogin).set('Accept', 'application/json');
    expect(response.body.status).toEqual('success');
    expect(response.body.statusCode).toEqual(200);
    expect(response.body.message).toEqual('User logged in successfully');
  });

  it('should return failed to login because wrong password', async () => {
    const userLogin = {
      username: 'hanna',
      password: '123456',
    };
    const response = await request(app).post('/api/user/login').send(userLogin).set('Accept', 'application/json');
    expect(response.body.status).toEqual('error');
    expect(response.body.statusCode).toEqual(404);
    expect(response.body.message).toEqual('Wrong Password');
  });

  it('should return failed to login because username not registered', async () => {
    const userLogin = {
      username: 'han',
      password: '123',
    };
    const response = await request(app).post('/api/user/login').send(userLogin).set('Accept', 'application/json');
    expect(response.body.status).toEqual('error');
    expect(response.body.statusCode).toEqual(404);
    expect(response.body.message).toEqual('Username incorrect');
  });

  // +++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++
  // USER / CHANGE PASSWORD
  // +++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++
});
