import { Sequelize } from 'sequelize';
import database from '../config/database.js';
import recipeModel from '../models/recipeModel.js';
import userModel from '../models/userModel.js';
import otpModel from '../models/otpModel.js';
import postModel from '../models/postModel.js';
import filesModel from '../models/fileModel.js';
import friendModel from '../models/friendModel.js';
import likeModel from '../models/likeModel.js';

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
export const otp = otpModel(db);
export const post = postModel(db);
export const filedb = filesModel(db);
export const friend = friendModel(db);
export const like_db = likeModel(db);
// Define associations
user.hasMany(recipe, { foreignKey: 'user_id', as: 'myRecipes' });
recipe.belongsTo(user, { foreignKey: 'user_id', as: 'user' });
user.hasMany(post, { foreignKey: 'user_id', as: 'posts' });
post.belongsTo(user, { foreignKey: 'user_id', as: 'user' });
post.hasMany(filedb, { foreignKey: 'post_id', as: 'files' });
// Definisi relasi hasMany ke friend untuk askedUser
user.hasMany(friend, {
  foreignKey: 'user_ask',
  as: 'askedUserFriends', // Ini adalah alias untuk relasi dengan askedUser
});

// Definisi relasi hasMany ke friend untuk receivedUser
user.hasMany(friend, {
  foreignKey: 'user_receive',
  as: 'receivedUserFriends', // Ini adalah alias untuk relasi dengan receivedUser
});

friend.belongsTo(user, {
  foreignKey: 'user_ask',
  as: 'askedUser',
});

friend.belongsTo(user, {
  foreignKey: 'user_receive',
  as: 'receivedUser',
});

post.hasMany(like_db, { foreignKey: 'post_id', as: 'likes' });
user.hasMany(like_db, { foreignKey: 'user_id', as: 'userLikes' });

export default db;
