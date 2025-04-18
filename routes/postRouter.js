import express from 'express';
import postController from '../controllers/postController.js';
import likeController from '../controllers/likeController.js';
import jwt from 'jsonwebtoken';
import dotenv from 'dotenv';
import upload from '../helper/multerHelper.js';
import commentController from '../controllers/commentController.js';
dotenv.config();

const postRouter = express.Router();

function authenticateToken(req, res, next) {
  try {
    const authHeader = req.headers['authorization'];
    const token = authHeader && authHeader.split(' ')[1];
    // console.log(token, 'token');
    if (token == null)
      return res.status(402).json({
        statusCode: 402,
        status: 'failed',
        message: 'unauthorized',
      });

    jwt.verify(token, process.env.TOKEN_SECRET, (err, user) => {
      console.log(err);

      if (err) {
        return res.status(403).json({
          statusCode: 403,
          status: 'failed',
          message: 'unauthorized',
        });
      }

      req.user = user;

      next();
    });
  } catch (err) {
    res.status(500).json({
      statusCode: 500,
      status: 'failed',
      message: 'Internal server error',
    });
  }
}
postRouter.post('/', authenticateToken, upload.array('path'), postController.post);
postRouter.get('/', authenticateToken, postController.getPost);
postRouter.get('/:id', authenticateToken, postController.detailPost);
postRouter.delete('/:id', authenticateToken, postController.deletePost);
postRouter.post('/like', authenticateToken, likeController.doLike);
postRouter.post('/comment', authenticateToken, commentController.createComment);
postRouter.delete('/comment/:id', authenticateToken, commentController.destroyComment);

export default postRouter;
