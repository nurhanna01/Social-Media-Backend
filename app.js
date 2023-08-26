import express from 'express';
import cors from 'cors';
import db from './database/db.js';
import recipeRouter from './routes/recipeRouter.js';
import userRouter from './routes/userRouter.js';

const port = process.env.PORT || 3000;

const app = express();
app.use(express.json());
app.use(express.urlencoded({ extended: false }));
app.use(cors());

db.sync({ force: false })
  .then(() => {
    // console.log('Database connected!');
  })
  .catch((err) => {
    // console.log('Failed to sync database', err);
  });

app.use('/api/recipe', recipeRouter);
app.use('/api/user', userRouter);

app.use(express.static('public/images'));

export default app;
