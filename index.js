import express from 'express';
import cors from 'cors';
import db from './database/db.js';
import recipeRouter from './routes/recipeRouter.js';
import userRouter from './routes/userRouter.js';
import documentation from './documentation/documentation.js';
import postRouter from './routes/postRouter.js';
import friendRouter from './routes/friendRouter.js';
import likeRouter from './routes/likeRouter.js';
import notificationRouter from './routes/notificationRouter.js';

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

app.use('/', documentation);
app.use('/api/recipe', recipeRouter);
app.use('/api/user', userRouter);
app.use('/api/post', postRouter);
app.use('/api/friends', friendRouter);
app.use('/api/notifications', notificationRouter);

app.use(express.static('public/images'));

app.all('*', (req, res) => {
  res.status(404).json({
    statusCode: 404,
    status: 'Not Found',
    message: 'API Not Found',
  });
});

app.listen(port, () => {
  console.log(`Listening culinary adventures on port ${port}`);
});

export default app;
