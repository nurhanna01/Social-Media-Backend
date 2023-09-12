import { recipe } from '../database/db.js';
import { user } from '../database/db.js';
import dotenv from 'dotenv';
dotenv.config();

const postController = {
  getRecipe: async (req, res) => {
    try {
      const recipes = await recipe.findAll();
      if (recipes) {
        res.json({
          statusCode: 200,
          status: 'success',
          message: 'Recipes retrieved successfully',
          data: recipes,
        });
      } else {
        res.status(404).json({
          statusCode: 404,
          status: 'error',
          message: 'No recipes found',
        });
      }
    } catch (err) {
      res.status(500).json({
        statusCode: 500,
        status: 'error',
        message: 'Internal server error',
        error: err,
      });
    }
  },

  getMyRecipe: async (req, res) => {
    try {
      const loginUser = await user.findOne({ where: { id: req.user.id } });
      const mydata = await recipe.findAll({ where: { user_id: loginUser.id } });

      if (mydata.length > 0) {
        res.status(200).json({
          statusCode: 200,
          status: 'success',
          message: 'Recipes retrieved successfully',
          data: mydata,
        });
      } else {
        res.status(404).json({
          statusCode: 404,
          status: 'error',
          message: 'No recipes found',
        });
      }
    } catch (err) {
      res.status(500).json({
        statusCode: 500,
        status: 'error',
        message: 'Internal server error',
        error: err.message,
      });
    }
  },

  postRecipe: async (req, res) => {
    try {
      const loginUser = await user.findOne({ where: { id: req.user.id } });
      const newRecipe = {
        title: req.body.title,
        description: req.body.description,
        ingredients: req.body.ingredients,
        instructions: req.body.instructions,
        path: `${req.protocol}://${req.get('host')}/${req.file.filename}`,
        category: req.body.category,
        user_id: loginUser.id,
      };
      const postRecipe = await recipe.create(newRecipe);
      if (postRecipe) {
        res.status(201).json({
          statusCode: 201,
          status: 'success',
          message: 'Recipe created successfully',
          data: postRecipe,
        });
      } else {
        res.status(404).json({
          statusCode: 404,
          status: 'error',
          message: 'Recipe failed to be created successfully',
        });
      }
    } catch (err) {
      res.status(500).json({
        statusCode: 500,
        status: 'error',
        message: 'Internal server error',
        error: err.message,
      });
    }
  },

  putRecipe: async (req, res) => {
    try {
      const loginUser = await user.findOne({ where: { id: req.user.id } });
      const user_data = await recipe.findOne({ where: { id: req.params.id } });
      if (!user_data) {
        res.status(404).json({
          statusCode: 404,
          status: 'failed',
          message: 'recipe not found',
        });
        return;
      }

      if (loginUser.id != user_data.user_id) {
        res.status(403).json({
          statusCode: 403,
          status: 'Forbidden',
          message: 'Access to this resource is restricted.',
        });
        return;
      }
      const updateRecipe = {
        title: req.body.title,
        description: req.body.description,
        ingredients: req.body.ingredients,
        instructions: req.body.instructions,
        image: req.body.filepath,
        category: req.body.category,
      };

      const put = await recipe.update(updateRecipe, {
        where: {
          id: req.params.id,
        },
      });

      if (put == 1) {
        res.status(200).json({
          statusCode: 200,
          status: 'success',
          message: 'Recipe updated successfully',
        });
      } else if (put == 0) {
        res.status(404).json({
          statusCode: 404,
          status: 'error',
          message: 'Recipe not found',
        });
        return;
      }
    } catch (err) {
      res.json({
        statusCode: 500,
        status: 'error',
        message: 'Internal server error',
        error: err.message,
      });
    }
  },

  deleteRecipe: async (req, res) => {
    try {
      const loginUser = await user.findOne({ where: { id: req.user.id } });
      const user_data = await recipe.findOne({ where: { id: req.params.id } });
      if (!user_data) {
        res.status(404).json({
          statusCode: 404,
          status: 'failed',
          message: 'Recipe not found',
        });
        return;
      }
      if (loginUser.id != user_data.user_id) {
        res.json({
          statusCode: 403,
          status: 'Forbidden',
          message: 'Access to this resource is restricted.',
        });
        return;
      }

      const deleteRecipe = await recipe.destroy({
        where: {
          id: req.params.id,
        },
      });
      if (deleteRecipe == 1) {
        res.status(200).json({
          statusCode: 200,
          status: 'success',
          message: 'Recipe deleted successfully',
        });
      }
      if (deleteRecipe == 0) {
        res.status(404).json({
          statusCode: 404,
          status: 'error',
          message: 'Recipe not found',
        });
      }
    } catch (err) {
      res.status(500).json({
        statusCode: 500,
        status: 'error',
        message: 'Internal server error',
        error: err.message,
      });
    }
  },
};

export default postController;
