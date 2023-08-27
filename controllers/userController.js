// NOTES : for unit tests
// uncomment the following line if you do unit testing with supertest, & comment imprt from db.js
// import { user, recipe } from '../__test__/db_mock.js';
import { user, recipe } from '../database/db.js';
import jwt from 'jsonwebtoken';
import dotenv from 'dotenv';
import bcrypt, { hash } from 'bcrypt';
import nodemailer from 'nodemailer';
import randtoken from 'rand-token';
dotenv.config();
const isValidEmail = (email) => {
  const emailRegex = /^[a-zA-Z0-9._-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,4}$/;
  return emailRegex.test(email);
};

const hashPassword = async (plaintextPassword) => {
  const hash = await bcrypt.hash(plaintextPassword, 10);
  return hash;
};

const comparePassword = async (plaintextPassword, hash) => {
  const result = await bcrypt.compare(plaintextPassword, hash);
  return result;
};

function generateAccessToken(payload) {
  return jwt.sign(payload, process.env.TOKEN_SECRET, { expiresIn: '14400s' });
}

const userController = {
  getUser: async function (req, res) {
    try {
      const findUser = await user.findOne({
        where: { id: req.user.id },
        attributes: ['username', 'email', 'active'],
        include: [
          {
            model: recipe,
            as: 'myRecipes',
          },
        ],
      });

      if (findUser) {
        res.json({
          statusCode: 200,
          status: 'success',
          data: findUser,
        });
      } else {
        res.json({
          statusCode: 404,
          status: 'error',
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

  registerUser: async (req, res) => {
    try {
      if (!req.body.username || req.body.username.trim() === '') {
        res.json({
          statusCode: 400,
          status: 'error',
          message: 'Username cannot be empty',
        });
        return;
      }

      if (!req.body.password || req.body.password.trim() === '') {
        res.json({
          statusCode: 400,
          status: 'error',
          message: 'password cannot be empty',
        });
        return;
      }
      const findUsername = await user.findOne({ where: { username: req.body.username } });
      if (findUsername) {
        res.json({
          statusCode: 400,
          status: 'error',
          message: 'Username already exists',
        });
        return;
      }
      if (!isValidEmail(req.body.email)) {
        res.json({
          statusCode: 400,
          status: 'error',
          message: 'Invalid email format',
        });
        return;
      }
      const findEmail = await user.findOne({ where: { email: req.body.email } });
      if (findEmail) {
        res.json({
          statusCode: 400,
          status: 'error',
          message: 'Email already used',
        });
        return;
      }
      const newUser = {
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
        res.json({
          statusCode: 201,
          status: 'success',
          message: 'User created successfully',
          data: postUserToReturn,
        });
      } else {
        res.json({
          statusCode: 404,
          status: 'error',
          message: 'Bad Request',
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
          res.json({
            status: 'success',
            statusCode: 200,
            message: 'User logged in successfully',
            data: selectedUser,
            token: token,
          });
        } else {
          res.json({
            status: 'error',
            statusCode: 404,
            message: 'Wrong Password',
          });
        }
      } else {
        res.json({
          statusCode: 404,
          status: 'error',
          message: 'Username incorrect',
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

  sendOtp: async (req, res) => {
    try {
      // const current = new Date();
      // const formattedDate = dateTime(current);
      const findUser = await user.findByPk(req.user.id);
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
      const otp = Math.floor(100000 + Math.random() * 900000);
      const mailData = {
        from: 'nurhanna@mail.com', // sender address
        to: findUser.email, // list of receivers
        subject: 'Code Verification for Cullinary Adventures Application',
        html: `<b>Hey there! Hanna here:)</b>
             <br>This is your OTP verification code ${otp}<br/>
             please enter your code in Cullinary Adventures App`,
      };
      user.update(
        { otp: otp },
        {
          where: {
            id: req.user.id,
          },
        }
      );
      transporter.sendMail(mailData, function (err, info) {
        if (err) {
          res.json({
            statusCode: 404,
            status: 'error',
            message: 'An error occurred while sending the email',
          });
          return;
        } else {
          res.json({
            statusCode: 200,
            status: 'success',
            message: 'OTP already sent successfully,Please check your email',
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

  verifyAccount: async (req, res) => {
    try {
      const findUser = await user.findOne({ where: { id: req.user.id } });
      if (findUser) {
        if (findUser.otp == req.body.otp) {
          // check expired otp (should not more than 2 minutes)
          const currentTime = new Date();
          const userUpdatedAt = new Date(findUser.updatedAt);
          const timeDifferenceInMs = currentTime - userUpdatedAt;
          const timeDifferenceInSeconds = Math.floor(timeDifferenceInMs / 1000);
          if (timeDifferenceInSeconds > 120) {
            res.json({
              statusCode: 400,
              status: 'Bad Request',
              message: 'OTP already expired, please request for new OTP',
            });
            return;
          }
          user.update(
            { active: true },
            {
              where: {
                id: findUser.id,
              },
            }
          );
          res.json({
            statusCode: 200,
            status: 'success',
            message: 'Account verified successfully',
          });
        } else {
          res.json({
            statusCode: 404,
            status: 'Not Found',
            message: 'Invalid OTP',
          });
        }
      } else {
        res.json({
          status: 'Not Found',
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
