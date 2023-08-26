import express from 'express';
import userController from '../controllers/userController.js';
import jwt from 'jsonwebtoken';
import dotenv from 'dotenv';
dotenv.config();

const userRouter = express.Router();

function authenticateToken(req, res, next) {
  try {
    const authHeader = req.headers['authorization'];
    const token = authHeader && authHeader.split(' ')[1];

    if (token == null)
      return res.json({
        statusCode: 403,
        status: 'failed',
        message: 'unauthorized',
      });

    jwt.verify(token, process.env.TOKEN_SECRET, (err, user) => {
      console.log(err);

      if (err)
        return res.status(403).json({
          statusCode: 403,
          status: 'failed',
          message: 'unauthorized',
        });

      req.user = user;

      next();
    });
  } catch (err) {
    res.json({
      statusCode: 500,
      status: 'failed',
      message: 'Internal server error',
    });
  }
}
userRouter.get('/', authenticateToken, userController.getUser);
userRouter.post('/register', userController.registerUser);
userRouter.post('/login', userController.loginUser);
userRouter.post('/otp', authenticateToken, userController.sendOtp);
userRouter.put('/verify', authenticateToken, userController.verifyAccount);
userRouter.put('/change-password', authenticateToken, userController.changePassword);
userRouter.post('/forgot-password', userController.forgotPassword);
userRouter.put('/reset-password', userController.resetPassword);

export default userRouter;
