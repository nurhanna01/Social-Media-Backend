import { DataTypes } from 'sequelize';
const userModel = (sequelize) =>
  sequelize.define('users', {
    username: {
      type: DataTypes.STRING,
      allowNull: false,
      unique: true,
    },
    password: {
      type: DataTypes.STRING,
      allowNull: false,
    },
    email: {
      type: DataTypes.STRING,
      unique: true,
      allowNull: false,
    },
    active: {
      type: DataTypes.BOOLEAN,
      defaultValue: false,
    },
    fullname: {
      type: DataTypes.STRING,
      allowNull: true,
    },
    birth: {
      type: DataTypes.DATE,
      allowNull: true,
    },
    originCity: {
      type: DataTypes.STRING,
      allowNull: true,
    },
    currentCity: {
      type: DataTypes.STRING,
      allowNull: true,
    },
    job: {
      type: DataTypes.STRING,
      allowNull: true,
    },
    shortBio: {
      type: DataTypes.STRING,
      allowNull: true,
    },
    photo_profile_path: {
      type: DataTypes.STRING,
      allowNull: true,
    },
    photo_cover_path: {
      type: DataTypes.STRING,
      allowNull: true,
    },
  });

export default userModel;
