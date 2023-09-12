import { DataTypes } from 'sequelize';
const filesModel = (sequelize) =>
  sequelize.define('files', {
    path: {
      type: DataTypes.STRING,
      allowNull: false,
    },
    post_id: DataTypes.INTEGER,
  });

export default filesModel;
