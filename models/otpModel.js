import { DataTypes } from 'sequelize';

const otpModel = (sequelize) =>
  sequelize.define('otps', {
    email: {
      type: DataTypes.STRING,
      allowNull: false,
      primaryKey: true,
      unique: true,
    },
    otp: {
      type: DataTypes.INTEGER,
      allowNull: false,
    },
    expired: {
      type: DataTypes.DATE,
      allowNull: false,
    },
  });

export default otpModel;
