import { DataTypes } from "sequelize";

const resetPasswordModel = (sequelize) =>
  sequelize.define("reset-passwords", {
    email: {
      type: DataTypes.STRING,
      allowNull: false,
    },
    token: {
      type: DataTypes.STRING,
      allowNull: false,
    },
    expired: {
      type: DataTypes.DATE,
      allowNull: false,
    },
  });

export default resetPasswordModel;
