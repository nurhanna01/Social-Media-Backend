import { Sequelize } from 'sequelize';
import database from '../config/database.js';
import recipeModel from '../models/recipeModel.js';
import userModel from '../models/userModel.js';

const db = new Sequelize(database.database, database.user, database.password, {
  host: database.host,
  dialect: 'mysql',
  pool: {
    max: 5,
    min: 0,
    acquire: 30000,
    idle: 10000,
  },
});

export const recipe = recipeModel(db);
export const user = userModel(db);
// Define associations
user.hasMany(recipe, { foreignKey: 'user_id', as: 'myRecipes' });
recipe.belongsTo(user, { foreignKey: 'user_id', as: 'user' });

export default db;
