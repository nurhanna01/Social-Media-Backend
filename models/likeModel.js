import { DataTypes } from 'sequelize';
const likeModel = (sequelize) =>
  sequelize.define('likes', {
    user_id: {
      type: DataTypes.INTEGER,
      allowNull: false,
    },
    post_id: {
      type: DataTypes.INTEGER,
      allowNull: false,
    },
  });

export default likeModel;
