import express from 'express';
import likeController from '../controllers/likeController.js';
import jwt from 'jsonwebtoken';
import dotenv from 'dotenv';
dotenv.config();

const likeRouter = express.Router();

function authenticateToken(req, res, next) {
  try {
    const authHeader = req.headers['authorization'];
    const token = authHeader && authHeader.split(' ')[1];
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
likeRouter.post('/', authenticateToken, likeController.doLike);

export default likeRouter;
