import { DataTypes } from 'sequelize';
const postModel = (sequelize) =>
  sequelize.define('posts', {
    description: {
      type: DataTypes.STRING,
      allowNull: false,
    },
    user_id: DataTypes.INTEGER,
  });

export default postModel;
