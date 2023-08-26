import express from 'express';
import recipeController from '../controllers/recipeController.js';
import jwt from 'jsonwebtoken';
import dotenv from 'dotenv';
import upload from '../helper/multerHelper.js';
dotenv.config();

const recipeRouter = express.Router();

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
      // console.log(err);

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

recipeRouter.get('/', authenticateToken, recipeController.getRecipe);
recipeRouter.get('/my', authenticateToken, recipeController.getMyRecipe);
recipeRouter.post('/', authenticateToken, upload.single('path'), recipeController.postRecipe);
recipeRouter.put('/:id', authenticateToken, recipeController.putRecipe);
recipeRouter.delete('/:id', authenticateToken, recipeController.deleteRecipe);

export default recipeRouter;
