import { DataTypes } from 'sequelize';
const notificationModel = (sequelize) =>
  sequelize.define('notifications', {
    user_id: {
      type: DataTypes.INTEGER,
      allowNull: false,
    },
    text: {
      type: DataTypes.TEXT('long'),
      allowNull: false,
    },
    isSeen: {
      type: DataTypes.BOOLEAN,
      defaultValue: false,
    },
  });

export default notificationModel;
