// NOTES : for unit tests
// uncomment the following line if you do unit testing with supertest, & comment imprt from db.js
// import { user, recipe } from '../__test__/db_mock.js';
import { user, post, otp, filedb, friend } from '../database/db.js';
import { Op } from 'sequelize';
import jwt from 'jsonwebtoken';
import dotenv from 'dotenv';
import bcrypt, { hash } from 'bcrypt';
import nodemailer from 'nodemailer';
import randtoken from 'rand-token';
import hashPassword from '../helper/hashPassword.js';
import addMinutesToDate from '../helper/addMinutesToDate.js';

dotenv.config();
const isValidEmail = (email) => {
  const emailRegex = /^[a-zA-Z0-9._-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,4}$/;
  return emailRegex.test(email);
};

const comparePassword = async (plaintextPassword, hash) => {
  const result = await bcrypt.compare(plaintextPassword, hash);
  return result;
};

function generateAccessToken(payload) {
  return jwt.sign(payload, process.env.TOKEN_SECRET, { expiresIn: '144000s' });
}

const userController = {
  // getPeople: async function (req, res) {
  //   try {
  //     const people = await user.findAll({
  //       where: {
  //         id: {
  //           [Op.not]: req.user.id,
  //         },
  //       },
  //       attributes: [
  //         'id',
  //         'username',
  //         'email',
  //         'fullname',
  //         'active',
  //         'birth',
  //         'originCity',
  //         'currentCity',
  //         'job',
  //         'shortBio',
  //         'photo_profile_path',
  //         'photo_cover_path',
  //       ],
  //     });
  //     if (people) {
  //       res.status(200).json({
  //         statusCode: 200,
  //         status: 'success',
  //         data: people,
  //       });
  //     } else {
  //       res.status(404).json({
  //         statusCode: 404,
  //         status: 'error',
  //         message: 'People not found',
  //       });
  //     }
  //   } catch (error) {
  //     res.status(500).json({
  //       statusCode: 500,
  //       status: 'error',
  //       message: 'Internal server error',
  //       error: error.message,
  //     });
  //   }
  // },

  getPeople: async (req, res) => {
    try {
      const userId = req.user.id;

      // hilangkan semua teman dari list yg akan ditampilkan
      const userFriends = await friend.findAll({
        where: {
          [Op.or]: [{ user_ask: userId }, { user_receive: userId }],
          // status: true,
        },
      });

      // Ambil ID pengguna yang berteman dengan pengguna yang sedang masuk
      const friendUserIds = userFriends.map((friendship) => {
        return friendship.user_ask === userId ? friendship.user_receive : friendship.user_ask;
      });

      // Ambil semua pengguna yang tidak ada dalam daftar pertemanan
      const people = await user.findAll({
        where: {
          id: {
            [Op.notIn]: [...friendUserIds, userId], // Hapus ID pengguna yang sedang masuk dan ID teman-teman
          },
        },
        attributes: [
          'id',
          'username',
          'email',
          'fullname',
          'active',
          'birth',
          'originCity',
          'currentCity',
          'job',
          'shortBio',
          'photo_profile_path',
          'photo_cover_path',
        ],
      });

      if (people) {
        res.status(200).json({
          statusCode: 200,
          status: 'success',
          data: people,
        });
      } else {
        res.status(404).json({
          statusCode: 404,
          status: 'error',
          message: 'People not found',
        });
      }
    } catch (error) {
      res.status(500).json({
        statusCode: 500,
        status: 'error',
        message: 'Internal server error',
        error: error.message,
      });
    }
  },

  // getPeopleDetail: async (req, res) => {
  //   try {
  //     const userId = req.user.id; // ID pengguna yang sedang masuk
  //     const targetUserId = req.params.id; // ID pengguna tujuan yang akan dilihat profilnya

  //     // Ambil data pengguna tujuan
  //     const targetUser = await user.findOne({
  //       where: { id: targetUserId },
  //       attributes: [
  //         'id',
  //         'username',
  //         'email',
  //         'fullname',
  //         'active',
  //         'birth',
  //         'originCity',
  //         'currentCity',
  //         'job',
  //         'shortBio',
  //         'photo_profile_path',
  //         'photo_cover_path',
  //       ],
  //     });

  //     if (!targetUser) {
  //       return res.status(404).json({
  //         statusCode: 404,
  //         status: 'error',
  //         message: 'User not found',
  //       });
  //     }

  //     // Cek status pertemanan antara pengguna yang sedang masuk dan pengguna tujuan
  //     const friendship = await friend.findOne({
  //       where: {
  //         [Op.or]: [
  //           { user_ask: userId, user_receive: targetUserId },
  //           { user_ask: targetUserId, user_receive: userId },
  //         ],
  //       },
  //     });

  //     let friendStatus = 'Not Friend'; // Default status jika bukan teman
  //     let friendStatusCode = 0;

  //     if (friendship) {
  //       if (friendship.status === true) {
  //         friendStatus = 'Friend';
  //         friendStatusCode = 1;
  //       } else {
  //         if (friendship.user_ask === userId) {
  //           friendStatus = 'Friend Request Sent';
  //           friendStatusCode = 2;
  //         } else {
  //           friendStatus = 'Friend Request Received';
  //           friendStatusCode = 3;
  //         }
  //       }
  //     }

  //     res.status(200).json({
  //       statusCode: 200,
  //       status: 'success',
  //       data: {
  //         ...targetUser.toJSON(),
  //         friendStatus,
  //         friendStatusCode,
  //       },
  //     });
  //   } catch (error) {
  //     res.status(500).json({
  //       statusCode: 500,
  //       status: 'error',
  //       message: 'Internal server error',
  //       error: error.message,
  //     });
  //   }
  // },

  getPeopleDetail: async (req, res) => {
    try {
      const targetUserId = req.params.id;

      // Ambil data pengguna tujuan
      const targetUser = await user.findOne({
        where: { id: targetUserId },
        attributes: [
          'id',
          'username',
          'email',
          'fullname',
          'active',
          'birth',
          'originCity',
          'currentCity',
          'job',
          'shortBio',
          'photo_profile_path',
          'photo_cover_path',
        ],
        include: [
          {
            model: post,
            as: 'posts',
            include: [
              { model: filedb, as: 'files' },
              {
                model: user,
                as: 'user',
                attributes: ['username', 'email', 'fullname', 'active', 'photo_profile_path', 'photo_cover_path'],
              },
            ],
          },
        ],
      });

      if (!targetUser) {
        return res.status(404).json({
          statusCode: 404,
          status: 'error',
          message: 'User not found',
        });
      }
      // cari teman dia
      const theirFriend = await friend.findAll({
        where: {
          [Op.or]: [{ user_ask: targetUserId }, { user_receive: targetUserId }],
          status: true,
        },
      });
      console.log(theirFriend, 'a');

      const dataFriends = [];
      if (theirFriend.length > 0) {
        for (const friend of theirFriend) {
          const friendId = friend.user_ask === targetUserId ? friend.user_receive : friend.user_ask;

          const friendProfile = await user.findOne({
            where: { id: friendId },
            attributes: [
              'username',
              'email',
              'fullname',
              'active',
              'birth',
              'originCity',
              'currentCity',
              'job',
              'shortBio',
              'photo_profile_path',
              'photo_cover_path',
            ],
          });
          if (friendProfile) {
            dataFriends.push(friendProfile);
          }
        }
      }

      targetUser.dataValues.friends = dataFriends;

      // Cek status pertemanan antara pengguna yang sedang masuk dan pengguna tujuan
      const friendship = await friend.findOne({
        where: {
          [Op.or]: [
            { user_ask: req.user.id, user_receive: targetUserId },
            { user_ask: targetUserId, user_receive: req.user.id },
          ],
        },
      });

      let friendStatus = 'Not Friend'; // Default status jika bukan teman
      let friendStatusCode = 0;

      if (friendship) {
        if (friendship.status === true) {
          friendStatus = 'Friend';
          friendStatusCode = 1;
        } else {
          if (friendship.user_ask === req.user.id) {
            friendStatus = 'Permintaan pertemanan sudah terkirim';
            friendStatusCode = 2;
          } else {
            friendStatus = 'Terima pertemanan';
            friendStatusCode = 3;
          }
        }
      }

      res.status(200).json({
        statusCode: 200,
        status: 'success',
        data: {
          ...targetUser.toJSON(),
          friendStatus,
          friendStatusCode,
        },
      });
    } catch (error) {
      res.status(500).json({
        statusCode: 500,
        status: 'error',
        message: 'Internal server error',
        error: error.message,
      });
    }
  },

  getMyprofile: async function (req, res) {
    try {
      const findUser = await user.findOne({
        where: { id: req.user.id },
        attributes: [
          'username',
          'email',
          'fullname',
          'active',
          'birth',
          'originCity',
          'currentCity',
          'job',
          'shortBio',
          'photo_profile_path',
          'photo_cover_path',
        ],
        include: [
          {
            model: post,
            as: 'posts',
            include: [
              { model: filedb, as: 'files' },
              {
                model: user,
                as: 'user',
                attributes: ['username', 'email', 'fullname', 'active', 'photo_profile_path', 'photo_cover_path'],
              },
            ],
          },
        ],
      });

      if (!findUser) {
        res.status(404).json({
          statusCode: 404,
          status: 'error',
          message: 'User not found',
        });
      }

      // cari teman saya
      const myFriend = await friend.findAll({
        where: {
          [Op.or]: [{ user_ask: req.user.id }, { user_receive: req.user.id }],
          status: true,
        },
      });

      const dataMyFriend = [];
      for (const friend of myFriend) {
        const friendId = friend.user_ask === req.user.id ? friend.user_receive : friend.user_ask;

        const friendProfile = await user.findOne({
          where: {
            id: friendId,
          },
          attributes: [
            'username',
            'email',
            'fullname',
            'active',
            'birth',
            'originCity',
            'currentCity',
            'job',
            'shortBio',
            'photo_profile_path',
            'photo_cover_path',
          ],
        });
        if (friendProfile) {
          dataMyFriend.push(friendProfile);
        }
      }

      findUser.dataValues.friends = dataMyFriend;

      res.status(200).json({
        statusCode: 200,
        status: 'success',
        message: 'Success get my profile',
        data: findUser,
      });
    } catch (err) {
      res.status(500).json({
        statusCode: 500,
        status: 'error',
        message: 'Internal server error',
        error: err.message,
      });
    }
  },

  updateprofile: async function (req, res) {
    const updatedUserData = {
      username: req.body.username,
      email: req.body.email,
      fullname: req.body.fullname,
      birth: req.body.birth,
      originCity: req.body.originCity,
      currentCity: req.body.currentCity,
      job: req.body.job,
      shortBio: req.body.shortBio,
      // photo_profile_path: photo_profile_path,
      // photo_cover_path: photo_cover_path,
    };
    let photo_profile_path = '';
    let photo_cover_path = '';

    if (req.files['photo_profile_path']) {
      photo_profile_path = `${req.protocol}://${req.get('host')}/${req.files['photo_profile_path'][0].filename}`;
      updatedUserData.photo_profile_path = photo_profile_path;
    }

    if (req.files['photo_cover_path']) {
      photo_cover_path = `${req.protocol}://${req.get('host')}/${req.files['photo_cover_path'][0].filename}`;
      updatedUserData.photo_cover_path = photo_cover_path;
    }

    try {
      const userToUpdate = await user.findOne({ where: { id: req.user.id } });

      if (!userToUpdate) {
        return res.status(404).json({
          statusCode: 404,
          status: 'failed',
          message: 'User not found',
        });
      }

      // Anda juga dapat menambahkan logika otorisasi di sini jika diperlukan

      const updatedUser = await user.update(updatedUserData, {
        where: { id: req.user.id },
      });

      if (updatedUser[0] === 1) {
        res.status(200).json({
          statusCode: 200,
          status: 'success',
          message: 'User updated successfully',
        });
      } else {
        res.status(500).json({
          statusCode: 500,
          status: 'error',
          message: 'Failed to update user',
        });
      }
    } catch (err) {
      console.error(err);
      res.status(500).json({
        statusCode: 500,
        status: 'error',
        message: 'Internal server error',
        error: err.message,
      });
    }
  },

  registerUser: async (req, res) => {
    try {
      if (!req.body.fullname || req.body.fullname.trim() === '') {
        res.status(400).json({
          statusCode: 400,
          status: 'error',
          message: 'FullName cannot be empty',
        });
        return;
      }

      if (!req.body.username || req.body.username.trim() === '') {
        res.status(400).json({
          statusCode: 400,
          status: 'error',
          message: 'Username cannot be empty',
        });
        return;
      }

      if (!req.body.email || req.body.email.trim() === '') {
        res.status(400).json({
          statusCode: 400,
          status: 'error',
          message: 'Email cannot be empty',
        });
        return;
      }

      if (!req.body.password || req.body.password.trim() === '') {
        res.status(400).json({
          statusCode: 400,
          status: 'error',
          message: 'password cannot be empty',
        });
        return;
      }
      const findUsername = await user.findOne({ where: { username: req.body.username } });
      if (findUsername) {
        res.status(400).json({
          statusCode: 400,
          status: 'error',
          message: 'Username already exists',
        });
        return;
      }
      if (!isValidEmail(req.body.email)) {
        res.status(400).json({
          statusCode: 400,
          status: 'error',
          message: 'Invalid email format',
        });
        return;
      }
      const findEmail = await user.findOne({ where: { email: req.body.email } });
      if (findEmail) {
        res.status(400).json({
          statusCode: 400,
          status: 'error',
          message: 'Email already used',
        });
        return;
      }
      const newUser = {
        fullname: req.body.fullname,
        username: req.body.username,
        password: await hashPassword(req.body.password),
        email: req.body.email,
      };
      const postUser = await user.create(newUser);
      const postUserToReturn = {
        email: postUser.email,
        username: postUser.username,
        active: postUser.active,
      };
      if (postUser) {
        res.status(201).json({
          statusCode: 201,
          status: 'success',
          message: 'User created successfully',
          data: postUserToReturn,
        });
      } else {
        res.status(400).json({
          statusCode: 404,
          status: 'error',
          message: 'Bad Request',
        });
      }
    } catch (err) {
      res.status(500).json({
        statusCode: 500,
        status: 'error',
        message: 'Internal server error',
        error: err.message,
      });
    }
  },

  loginUser: async function (req, res) {
    try {
      const findUser = await user.findOne({ where: { username: req.body.username } });
      if (findUser) {
        const checkPassword = await comparePassword(req.body.password, findUser.password);
        const selectedUser = {
          email: findUser.email,
          username: findUser.username,
          status_active: findUser.active,
        };
        if (checkPassword) {
          const token = generateAccessToken({ id: findUser.id });
          res.status(200).json({
            status: 'success',
            statusCode: 200,
            message: 'User logged in successfully',
            data: selectedUser,
            token: token,
          });
        } else {
          res.status(404).json({
            status: 'error',
            statusCode: 404,
            message: 'Wrong Password',
          });
        }
      } else {
        res.status(404).json({
          statusCode: 404,
          status: 'error',
          message: 'Username incorrect',
        });
      }
    } catch (err) {
      res.status(500).json({
        statusCode: 500,
        status: 'error',
        message: 'Internal server error',
        error: err.message,
      });
    }
  },

  sendOtp: async (req, res) => {
    try {
      const email = req.body.email;
      const transporter = nodemailer.createTransport({
        service: 'gmail',
        auth: {
          user: process.env.EMAIL_ADDRESS,
          pass: process.env.EMAIL_PASSWORD,
        },
      });
      transporter.verify(function (error, success) {
        if (error) {
          res.status(500).json({
            status: 'error',
            statusCode: 500,
            message: 'Internal Server Error',
          });
          return;
        } else {
          console.log('Server is ready');
        }
      });
      const otpCode = Math.floor(100000 + Math.random() * 900000);
      const mailData = {
        from: 'nurhanna@mail.com',
        to: email,
        subject: 'Code Verification for Cullinary Adventures Application',
        html: `<b>Hey there! Hanna here:)</b>
             <br>This is your OTP verification code ${otpCode}<br/>
             please enter your code in Cullinary Adventures App`,
      };
      console.log(addMinutesToDate(2));
      const findEmail = await otp.findOne({ where: { email: email } });
      if (findEmail) {
        await otp.update(
          { otp: otpCode, expired: addMinutesToDate(2) },
          {
            where: {
              email,
            },
          }
        );
      } else {
        await otp.create({ email, otp: otpCode, expired: addMinutesToDate(2) });
      }

      transporter.sendMail(mailData, function (err, info) {
        if (err) {
          res.status(404).json({
            statusCode: 404,
            status: 'error',
            message: 'An error occurred while sending the email',
          });
          return;
        } else {
          res.status(200).json({
            statusCode: 200,
            status: 'success',
            message: 'OTP already sent successfully,Please check your email',
          });
        }
      });
    } catch (err) {
      res.status(500).json({
        statusCode: 500,
        status: 'error',
        message: 'Internal server error',
        error: err.message,
      });
      return;
    }
  },

  verifyEmailAccount: async (req, res) => {
    try {
      const findEmail = await otp.findOne({ where: { email: req.body.email } });

      if (!findEmail) {
        return res.status(404).json({
          statusCode: 404,
          status: 'Not Found',
          message: 'User not found',
        });
      }

      if (findEmail.otp != req.body.otp) {
        console.log(findEmail.otp, req.body.otp);
        return res.status(404).json({
          statusCode: 404,
          status: 'Not Found',
          message: 'Invalid OTP',
        });
      }

      const currentTime = new Date();
      if (findEmail.expired < currentTime) {
        return res.status(400).json({
          statusCode: 400,
          status: 'Bad Request',
          message: 'OTP already expired, please request a new OTP',
        });
      }

      const activeEmail = await user.update(
        { active: true },
        {
          where: { email: req.body.email },
        }
      );
      if (activeEmail == 1) {
        findEmail.destroy();
      }

      return res.status(200).json({
        statusCode: 200,
        status: 'Success',
        message: 'Account verified successfully',
      });
    } catch (err) {
      return res.status(500).json({
        statusCode: 500,
        status: 'Error',
        message: 'Internal server error',
        error: err.message,
      });
    }
  },

  changePassword: async function (req, res) {
    try {
      const findUser = await user.findOne({ where: { id: req.user.id } });
      if (findUser) {
        const checkPassword = await comparePassword(req.body.oldPassword, findUser.password);
        if (!checkPassword) {
          res.json({
            statusCode: 404,
            status: 'error',
            message: 'Invalid Old Password',
          });
        }
        if (!req.body.newPassword || req.body.newPassword.trim() === '') {
          res.json({
            statusCode: 400,
            status: 'error',
            message: 'New password cannot be empty',
          });
          return;
        }

        if (checkPassword) {
          const updateUser = await user.update(
            {
              password: await hashPassword(req.body.newPassword),
            },
            {
              where: { id: req.user.id },
            }
          );
          if (updateUser == 1) {
            res.json({
              statusCode: 200,
              status: 'success',
              message: 'Password changed successfully',
            });
          }
          if (updateUser == 0) {
            res.json({
              statusCode: 200,
              status: 'success',
              message: 'Password changed failed',
            });
          }
        }
      } else {
        res.json({
          status: 'error',
          statusCode: 404,
          message: 'User not found',
        });
      }
    } catch (err) {
      res.json({
        statusCode: 500,
        status: 'error',
        message: 'Internal server error',
        error: err.message,
      });
    }
  },

  forgotPassword: async (req, res) => {
    try {
      const email = req.body.email;
      const checkUser = await user.findOne({ where: { email: email } });
      if (!checkUser) {
        res.json({
          status: 'error',
          statusCode: 404,
          message: 'Email addres not registered',
        });
        return;
      }
      const transporter = nodemailer.createTransport({
        service: 'gmail',
        // host: 'smtp.mailtrap.io',
        // port: 2525,
        auth: {
          user: process.env.EMAIL_ADDRESS,
          pass: process.env.EMAIL_PASSWORD,
        },
      });
      transporter.verify(function (error, success) {
        if (error) {
          res.json({
            status: 'error',
            statusCode: 500,
            message: 'Internal Server Error',
          });
          return;
        } else {
          // console.log('Server is ready');
        }
      });
      const token = randtoken.generate(20);
      const mailData = {
        from: 'nurhanna@mail.com', // sender address
        to: req.body.email, // list of receivers
        subject: 'Reset Email for Cullinary Adventures Application',
        html: `<b>Hey there! Hanna here:)</b>
             <br><p>You requested for reset password, kindly to <a href="http://localhost:3000/api/user/reset-password?token=${token}">Click here to reset your password</a></p><br/>`,
      };

      transporter.sendMail(mailData, function (err, info) {
        if (err) {
          res.json({
            statusCode: 404,
            status: 'error',
            message: 'An error occurred while sending the email',
          });
          return;
        } else {
          user.update(
            { token: token },
            {
              where: {
                id: checkUser.id,
              },
            }
          );
          res.json({
            statusCode: 200,
            status: 'success',
            message: 'link for reset password already sent successfully,Please check your email',
          });
        }
      });
    } catch (err) {
      res.json({
        statusCode: 500,
        status: 'error',
        message: 'Internal server error',
        error: err.message,
      });
      return;
    }
  },

  resetPassword: async (req, res) => {
    try {
      const { password } = req.body;
      const token = req.query.token;
      const findUser = await user.findOne({ where: { token: token } });
      if (!findUser) {
        res.json({
          status: 'error',
          statusCode: 404,
          message: 'User not found',
        });
        return;
      } else {
        if (!req.body.password || req.body.password.trim() === '') {
          res.json({
            statusCode: 400,
            status: 'error',
            message: 'password cannot be empty',
          });
          return;
        }
        // check expired otp (should not more than 2 minutes)
        const currentTime = new Date();
        const userUpdatedAt = new Date(findUser.updatedAt);
        const timeDifferenceInMs = currentTime - userUpdatedAt;
        const timeDifferenceInSeconds = Math.floor(timeDifferenceInMs / 1000);
        if (timeDifferenceInSeconds > 120) {
          res.json({
            statusCode: 400,
            status: 'Bad Request',
            message: 'Link already expired, please request new link for reset password',
          });
          return;
        }
        user.update(
          { password: await hashPassword(password) },
          {
            where: {
              id: findUser.id,
            },
          }
        );
        res.json({
          status: 'success',
          statusCode: 200,
          message: 'Password already reset successfully',
        });
      }
    } catch (err) {
      res.json({
        status: 'error',
        statusCode: 500,
        message: 'Internal server error',
        error: err.message,
      });
    }
  },
};

export default userController;
