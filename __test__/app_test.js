import express from 'express';
import cors from 'cors';
import db_test from './db_test.js';
import recipeRouter from '../routes/recipeRouter.js';
import userRouter from '../routes/userRouter.js';

const port = process.env.PORT || 3000;

const app_test = express();
app_test.use(express.json());
app_test.use(express.urlencoded({ extended: false }));
app_test.use(cors());

db_test
  .sync({ force: false })
  .then(() => {
    console.log('Database Test connected!');
  })
  .catch((err) => {
    console.log('Failed to sync database test', err.message);
  });

app_test.use('/api/recipe', recipeRouter);
app_test.use('/api/user', userRouter);

app_test.use(express.static('public/images'));

export default app_test;
