import { Sequelize } from 'sequelize';
import database from '../config/database.js';
import recipeModel from '../models/recipeModel.js';
import userModel from '../models/userModel.js';

const db_test = new Sequelize('culinary_adventures_test', database.user, database.password, {
  host: database.host,
  dialect: 'mysql',
  pool: {
    max: 5,
    min: 0,
    acquire: 30000,
    idle: 10000,
  },
});

export const recipe = recipeModel(db_test);
export const user = userModel(db_test);
// Define associations
user.hasMany(recipe, { foreignKey: 'user_id', as: 'myRecipes' });
recipe.belongsTo(user, { foreignKey: 'user_id', as: 'user' });

export default db_test;
