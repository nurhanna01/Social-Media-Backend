import { DataTypes } from 'sequelize';
const commentModel = (sequelize) =>
  sequelize.define('comments', {
    user_id: {
      type: DataTypes.INTEGER,
      allowNull: false,
    },
    post_id: {
      type: DataTypes.INTEGER,
      allowNull: false,
    },
    comment: {
      type: DataTypes.TEXT('long'),
      allowNull: false,
    },
  });

export default commentModel;
