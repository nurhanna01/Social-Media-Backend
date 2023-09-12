import { DataTypes } from 'sequelize';
const postTagModel = (sequelize) =>
  sequelize.define('recipes', {
    description: {
      type: DataTypes.STRING,
      allowNull: false,
    },
    user_id: DataTypes.INTEGER,
  });

export default postTagModel;
