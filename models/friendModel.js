import { DataTypes } from 'sequelize';
const friendModel = (sequelize) =>
  sequelize.define('friends', {
    user_ask: { type: DataTypes.INTEGER, allowNull: false },
    user_receive: { type: DataTypes.INTEGER, allowNull: false },
    status: {
      type: DataTypes.BOOLEAN,
      defaultValue: false,
    },
  });

export default friendModel;
