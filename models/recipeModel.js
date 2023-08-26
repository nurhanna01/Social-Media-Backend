import { DataTypes } from 'sequelize';
const recipeModel = (sequelize) =>
  sequelize.define('recipes', {
    title: {
      type: DataTypes.STRING,
      allowNull: false,
    },
    description: DataTypes.STRING,
    ingredients: DataTypes.STRING,
    instructions: DataTypes.STRING,
    path: DataTypes.STRING,
    category: DataTypes.STRING,
    user_id: DataTypes.INTEGER,
  });

export default recipeModel;
