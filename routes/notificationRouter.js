import express from 'express';
import notificationController from '../controllers/notificationsController.js';
import jwt from 'jsonwebtoken';
import dotenv from 'dotenv';
dotenv.config();

const notificationRouter = express.Router();

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
notificationRouter.get('/', authenticateToken, notificationController.getNotifications);
notificationRouter.post('/', authenticateToken, notificationController.createNotifications);
notificationRouter.put('/all', authenticateToken, notificationController.readAllUnreadNotifications);
notificationRouter.put('/:id', authenticateToken, notificationController.readNotification);

export default notificationRouter;
