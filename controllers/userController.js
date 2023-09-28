import {
  user,
  post,
  otp,
  filedb,
  friend,
  like_db,
  comment_db,
  resetPassword_db,
} from "../database/db.js";
import { Op, Sequelize } from "sequelize";
import jwt from "jsonwebtoken";
import dotenv from "dotenv";
import bcrypt, { hash } from "bcrypt";
import nodemailer from "nodemailer";
import randtoken from "rand-token";
import hashPassword from "../helper/hashPassword.js";
import addMinutesToDate from "../helper/addMinutesToDate.js";

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
  // 2
  return jwt.sign(payload, process.env.TOKEN_SECRET, { expiresIn: "172800s" });
}

const userController = {
  // orang yang belum berteman dengan saya
  getUnfriendPeople: async (req, res) => {
    try {
      const userId = req.user.id;

      // hilangkan semua teman dari list yg akan ditampilkan
      const userFriends = await friend.findAll({
        where: {
          [Op.or]: [{ user_ask: userId }, { user_receive: userId }],
          // status: true,
        },
      });

      // Ambil ID pengguna yang berteman dengan saya
      const friendUserIds = userFriends.map((friendship) => {
        return friendship.user_ask === userId
          ? friendship.user_receive
          : friendship.user_ask;
      });

      // Ambil semua pengguna yang tidak ada dalam daftar pertemanan
      const people = await user.findAll({
        where: {
          id: {
            [Op.notIn]: [...friendUserIds, userId], // Hapus ID pengguna yang sedang masuk dan ID teman-teman
          },
        },
        attributes: [
          "id",
          "username",
          "email",
          "fullname",
          "active",
          "birth",
          "originCity",
          "currentCity",
          "job",
          "shortBio",
          "photo_profile_path",
          "photo_cover_path",
        ],
        order: Sequelize.literal("RAND()"), // Menggunakan fungsi SQL RAND() untuk pengacakan
        limit: 100,
      });

      if (people) {
        res.status(200).json({
          statusCode: 200,
          status: "success",
          data: people,
        });
      } else {
        res.status(404).json({
          statusCode: 404,
          status: "error",
          message: "People not found",
        });
      }
    } catch (error) {
      res.status(500).json({
        statusCode: 500,
        status: "error",
        message: "Internal server error",
        error: error.message,
      });
    }
  },

  // semua orang
  getUsers: async (req, res) => {
    try {
      const userId = req.user.id;

      // Ambil semua pengguna yang tidak ada dalam daftar pertemanan
      const users = await user.findAll({
        where: {
          id: {
            [Op.notIn]: [userId],
          },
          // order: Sequelize.literal('RAND()'), // Menggunakan fungsi SQL RAND() untuk pengacakan
          // limit: 100,
        },
        attributes: [
          "id",
          "username",
          "email",
          "fullname",
          "active",
          "birth",
          "originCity",
          "currentCity",
          "job",
          "shortBio",
          "photo_profile_path",
          "photo_cover_path",
        ],
      });

      if (users) {
        res.status(200).json({
          statusCode: 200,
          status: "success",
          data: users,
        });
      } else {
        res.status(404).json({
          statusCode: 404,
          status: "error",
          message: "People not found",
        });
      }
    } catch (error) {
      res.status(500).json({
        statusCode: 500,
        status: "error",
        message: "Internal server error",
        error: error.message,
      });
    }
  },

  // cari user
  searchUsers: async (req, res) => {
    try {
      const userId = req.user.id;
      const { query, limit } = req.query;

      const whereCondition = {
        id: {
          [Op.notIn]: [userId],
        },
      };

      const users = await user.findAll({
        where: {
          fullname: {
            [Op.like]: Sequelize.fn("LOWER", `%${query}%`),
          },
        },
        attributes: [
          "id",
          "username",
          "email",
          "fullname",
          "active",
          "birth",
          "originCity",
          "currentCity",
          "job",
          "shortBio",
          "photo_profile_path",
          "photo_cover_path",
        ],
        limit: limit ? parseInt(limit) : undefined, // Gunakan limit jika disediakan dalam query
      });

      if (users) {
        res.status(200).json({
          statusCode: 200,
          status: "success",
          data: users,
        });
      } else {
        res.status(404).json({
          statusCode: 404,
          status: "error",
          message: "People not found",
        });
        return;
      }
    } catch (error) {
      res.status(500).json({
        statusCode: 500,
        status: "error",
        message: "Internal server error",
        error: error.message,
      });
    }
  },

  getPeopleDetail: async (req, res) => {
    try {
      const targetUserId = req.params.id;

      // Ambil data pengguna tujuan
      const targetUser = await user.findOne({
        where: { id: targetUserId },
        attributes: [
          "id",
          "username",
          "email",
          "fullname",
          "active",
          "birth",
          "originCity",
          "currentCity",
          "job",
          "shortBio",
          "photo_profile_path",
          "photo_cover_path",
        ],
        include: [
          {
            model: post,
            as: "posts",
            include: [
              { model: filedb, as: "files" },
              {
                model: user,
                as: "user",
                attributes: [
                  "id",
                  "username",
                  "email",
                  "fullname",
                  "active",
                  "photo_profile_path",
                  "photo_cover_path",
                ],
              },
              {
                model: like_db,
                as: "likes",
              },
            ],
          },
        ],
      });

      if (!targetUser) {
        return res.status(404).json({
          statusCode: 404,
          status: "error",
          message: "User not found",
        });
      }
      // supaya comment di masing2 post order desc karena comment tidak langsung ke post.
      const postsWithComments = await Promise.all(
        targetUser.posts.map(async (post) => {
          const comments = await comment_db.findAll({
            where: {
              post_id: post.id,
            },
            include: [
              {
                model: user,
                as: "user",
                attributes: [
                  "username",
                  "email",
                  "fullname",
                  "active",
                  "photo_profile_path",
                  "photo_cover_path",
                ],
              },
            ],
            order: [["createdAt", "DESC"]], // Urutan komentar berdasarkan createdAt
          });

          post.dataValues.comments = comments;
          return post;
        })
      );

      // Setelah mendapatkan semua komentar, masukkan hasilnya kembali ke findUser
      targetUser.posts = postsWithComments;

      // cek postingan orang ini, status like dia dengan saya
      targetUser.posts = targetUser.posts.map((post) => {
        const isLike = post.likes.some((like) => like.user_id === req.user.id);
        post.dataValues.isLike = isLike;
      });

      // cari teman dia
      const myFriend = await friend.findAll({
        where: {
          [Op.or]: [{ user_ask: targetUserId }, { user_receive: targetUserId }],
          status: true,
        },
      });

      const dataMyFriend = [];
      for (const friend of myFriend) {
        const friendId =
          friend.user_ask == targetUserId
            ? friend.user_receive
            : friend.user_ask;

        const friendProfile = await user.findOne({
          where: {
            id: friendId,
          },
          attributes: [
            "id",
            "username",
            "email",
            "fullname",
            "active",
            "birth",
            "originCity",
            "currentCity",
            "job",
            "shortBio",
            "photo_profile_path",
            "photo_cover_path",
          ],
        });
        if (friendProfile) {
          dataMyFriend.push(friendProfile);
        }
      }

      targetUser.dataValues.friends = dataMyFriend;

      // Cek status pertemanan antara pengguna yang sedang masuk dan pengguna tujuan
      const friendship = await friend.findOne({
        where: {
          [Op.or]: [
            { user_ask: req.user.id, user_receive: targetUserId },
            { user_ask: targetUserId, user_receive: req.user.id },
          ],
        },
      });

      let friendStatus = "Not Friend"; // Default status jika bukan teman
      let friendStatusCode = 0;

      if (friendship) {
        if (friendship.status === true) {
          friendStatus = "Friend";
          friendStatusCode = 1;
        } else {
          if (friendship.user_ask === req.user.id) {
            friendStatus = "Permintaan pertemanan sudah terkirim";
            friendStatusCode = 2;
          } else {
            friendStatus = "Terima pertemanan";
            friendStatusCode = 3;
          }
        }
      }

      res.status(200).json({
        statusCode: 200,
        status: "success",
        data: {
          ...targetUser.toJSON(),
          friendStatus,
          friendStatusCode,
        },
      });
    } catch (error) {
      res.status(500).json({
        statusCode: 500,
        status: "error",
        message: "Internal server error",
        error: error.message,
      });
    }
  },

  getMyprofile: async function (req, res) {
    try {
      const findUser = await user.findOne({
        where: { id: req.user.id },
        attributes: [
          "id",
          "username",
          "email",
          "fullname",
          "active",
          "birth",
          "originCity",
          "currentCity",
          "job",
          "shortBio",
          "photo_profile_path",
          "photo_cover_path",
        ],
        include: [
          {
            model: post,
            as: "posts",
            include: [
              { model: filedb, as: "files" },
              {
                model: user,
                as: "user",
                attributes: [
                  "id",
                  "username",
                  "email",
                  "fullname",
                  "active",
                  "photo_profile_path",
                  "photo_cover_path",
                ],
              },
              {
                model: like_db,
                as: "likes",
              },
              // {
              //   model: comment_db,
              //   as: 'comments',

              //   include: [
              //     {
              //       model: user,
              //       as: 'user',
              //       attributes: ['username', 'email', 'fullname', 'active', 'photo_profile_path', 'photo_cover_path'],
              //     },
              //   ],
              // },
            ],
          },
        ],
        order: [[post, "createdAt", "DESC"]],
      });

      if (!findUser) {
        res.status(404).json({
          statusCode: 404,
          status: "error",
          message: "User not found",
        });
      }
      // dapatkan komen berururtan untuk masing2 post secara terpisah dengan urutan yang smaa
      const postsWithComments = await Promise.all(
        findUser.posts.map(async (post) => {
          const comments = await comment_db.findAll({
            where: {
              post_id: post.id,
            },
            include: [
              {
                model: user,
                as: "user",
                attributes: [
                  "username",
                  "email",
                  "fullname",
                  "active",
                  "photo_profile_path",
                  "photo_cover_path",
                ],
              },
            ],
            order: [["createdAt", "DESC"]], // Urutan komentar berdasarkan createdAt
          });

          post.dataValues.comments = comments;
          return post;
        })
      );

      // Setelah mendapatkan semua komentar, masukkan hasilnya kembali ke findUser
      findUser.posts = postsWithComments;

      // cari teman saya
      const myFriend = await friend.findAll({
        where: {
          [Op.or]: [{ user_ask: req.user.id }, { user_receive: req.user.id }],
          status: true,
        },
      });

      const dataMyFriend = [];
      for (const friend of myFriend) {
        const friendId =
          friend.user_ask === req.user.id
            ? friend.user_receive
            : friend.user_ask;

        const friendProfile = await user.findOne({
          where: {
            id: friendId,
          },
          attributes: [
            "id",
            "username",
            "email",
            "fullname",
            "active",
            "birth",
            "originCity",
            "currentCity",
            "job",
            "shortBio",
            "photo_profile_path",
            "photo_cover_path",
          ],
        });
        if (friendProfile) {
          dataMyFriend.push(friendProfile);
        }
      }

      findUser.dataValues.friends = dataMyFriend;

      findUser.posts = findUser.posts.map((post) => {
        const isLike = post.likes.some((like) => like.user_id === req.user.id);
        post.dataValues.isLike = isLike;
      });

      res.status(200).json({
        statusCode: 200,
        status: "success",
        message: "Success get my profile",
        data: findUser,
      });
    } catch (err) {
      res.status(500).json({
        statusCode: 500,
        status: "error",
        message: "Internal server error",
        error: err.message,
      });
    }
  },

  updateprofile: async function (req, res) {
    if (!req.body.username || req.body.username.trim() === "") {
      res.status(400).json({
        statusCode: 400,
        status: "error",
        message: "Username cannot be empty",
      });
      return;
    }
    const findUsername = await user.findOne({
      where: { username: req.body.username, id: { [Op.ne]: req.user.id } },
    });

    if (findUsername) {
      res.status(400).json({
        statusCode: 400,
        status: "error",
        message: "Username already exists",
      });
      return;
    }
    const updatedUserData = {
      username: req.body.username,

      fullname: req.body.fullname,
      birth: req.body.birth,
      originCity: req.body.originCity,
      currentCity: req.body.currentCity,
      job: req.body.job,
      shortBio: req.body.shortBio,
      // photo_profile_path: photo_profile_path,
      // photo_cover_path: photo_cover_path,
    };
    let photo_profile_path = "";
    let photo_cover_path = "";

    if (req.files["photo_profile_path"]) {
      photo_profile_path = `${req.protocol}://${req.get("host")}/${
        req.files["photo_profile_path"][0].filename
      }`;
      updatedUserData.photo_profile_path = photo_profile_path;
    }

    if (req.files["photo_cover_path"]) {
      photo_cover_path = `${req.protocol}://${req.get("host")}/${
        req.files["photo_cover_path"][0].filename
      }`;
      updatedUserData.photo_cover_path = photo_cover_path;
    }

    try {
      const userToUpdate = await user.findOne({ where: { id: req.user.id } });

      if (!userToUpdate) {
        return res.status(404).json({
          statusCode: 404,
          status: "failed",
          message: "User not found",
        });
      }

      // Anda juga dapat menambahkan logika otorisasi di sini jika diperlukan

      const updatedUser = await user.update(updatedUserData, {
        where: { id: req.user.id },
      });

      if (updatedUser[0] === 1) {
        res.status(200).json({
          statusCode: 200,
          status: "success",
          message: "User updated successfully",
        });
      } else {
        res.status(500).json({
          statusCode: 500,
          status: "error",
          message: "Failed to update user",
        });
      }
    } catch (err) {
      res.status(500).json({
        statusCode: 500,
        status: "error",
        message: "Internal server error",
        error: err.message,
      });
    }
  },

  registerUser: async (req, res) => {
    try {
      if (!req.body.fullname || req.body.fullname.trim() === "") {
        res.status(400).json({
          statusCode: 400,
          status: "error",
          message: "FullName cannot be empty",
        });
        return;
      }

      if (!req.body.username || req.body.username.trim() === "") {
        res.status(400).json({
          statusCode: 400,
          status: "error",
          message: "Username cannot be empty",
        });
        return;
      }

      if (!req.body.email || req.body.email.trim() === "") {
        res.status(400).json({
          statusCode: 400,
          status: "error",
          message: "Email cannot be empty",
        });
        return;
      }

      if (!req.body.password || req.body.password.trim() === "") {
        res.status(400).json({
          statusCode: 400,
          status: "error",
          message: "password cannot be empty",
        });
        return;
      }
      const findUsername = await user.findOne({
        where: { username: req.body.username },
      });
      if (findUsername) {
        res.status(400).json({
          statusCode: 400,
          status: "error",
          message: "Username already exists",
        });
        return;
      }
      if (!isValidEmail(req.body.email)) {
        res.status(400).json({
          statusCode: 400,
          status: "error",
          message: "Invalid email format",
        });
        return;
      }
      const findEmail = await user.findOne({
        where: { email: req.body.email },
      });
      if (findEmail) {
        res.status(400).json({
          statusCode: 400,
          status: "error",
          message: "Email already used",
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
          status: "success",
          message: "User created successfully",
          data: postUserToReturn,
        });
      } else {
        res.status(400).json({
          statusCode: 400,
          status: "error",
          message: "Bad Request",
        });
      }
    } catch (err) {
      res.status(500).json({
        statusCode: 500,
        status: "error",
        message: "Internal server error",
        error: err.message,
      });
    }
  },

  loginUser: async function (req, res) {
    try {
      const findUser = await user.findOne({
        where: { username: req.body.username },
      });
      if (findUser) {
        const checkPassword = await comparePassword(
          req.body.password,
          findUser.password
        );
        const selectedUser = {
          email: findUser.email,
          username: findUser.username,
          status_active: findUser.active,
        };
        if (checkPassword) {
          const token = generateAccessToken({ id: findUser.id });
          res.status(200).json({
            status: "success",
            statusCode: 200,
            message: "User logged in successfully",
            data: selectedUser,
            token: token,
          });
        } else {
          res.status(404).json({
            status: "error",
            statusCode: 404,
            message: "Wrong Password",
          });
        }
      } else {
        res.status(404).json({
          statusCode: 404,
          status: "error",
          message: "Username incorrect",
        });
      }
    } catch (err) {
      res.status(500).json({
        statusCode: 500,
        status: "error",
        message: "Internal server error",
        error: err.message,
      });
    }
  },

  sendOtp: async (req, res) => {
    try {
      const email = req.body.email;
      const transporter = nodemailer.createTransport({
        service: "gmail",
        auth: {
          user: process.env.EMAIL_ADDRESS,
          pass: process.env.EMAIL_PASSWORD,
        },
      });
      transporter.verify(function (error, success) {
        if (error) {
          res.status(500).json({
            status: "error",
            statusCode: 500,
            message: "Internal Server Error",
          });
          return;
        } else {
          console.log("Server is ready");
        }
      });
      const otpCode = Math.floor(100000 + Math.random() * 900000);
      const mailData = {
        from: "nurhanna@mail.com",
        to: email,
        subject: "Code Verification for Social Media Application",
        html: `
          <div style="background-color: #f2f2f2; padding: 20px; font-family: Arial, sans-serif;">
            <div style="background-color: #ffffff; padding: 20px; border-radius: 10px; box-shadow: 0 2px 4px rgba(0, 0, 0, 0.1);">
              <h2 style="color: #333;">Hey there! <span style="font-size: 18px;">😊</span></h2>
              <p style="color: #555; margin-top: 10px;">This is your OTP verification code:</p>
              <div style="background-color: #007bff; color: #ffffff; padding: 10px 20px; font-size: 24px; text-align: center; border-radius: 5px;">
                ${otpCode}
              </div>
              <p style="color: #555; margin-top: 10px;">
                Please enter this code in the Social Media App to verify your account.
              </p>
              <p style="font-size: 16px;">Also, please note that this code will expire in 2 minutes.</p>
              <p style="color: #555; margin-top: 10px;">
                If you didn't request this code, you can safely ignore this email.
              </p>
            </div>
          </div>
        `,
      };

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
            status: "error",
            message: "An error occurred while sending the email",
          });
          return;
        } else {
          res.status(200).json({
            statusCode: 200,
            status: "success",
            message: "OTP already sent successfully,Please check your email",
          });
        }
      });
    } catch (err) {
      res.status(500).json({
        statusCode: 500,
        status: "error",
        message: "Internal server error",
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
          status: "Not Found",
          message: "User not found",
        });
      }

      if (findEmail.otp != req.body.otp) {
        return res.status(404).json({
          statusCode: 404,
          status: "Not Found",
          message: "Invalid OTP",
        });
      }

      const currentTime = new Date();
      if (findEmail.expired < currentTime) {
        return res.status(400).json({
          statusCode: 400,
          status: "Bad Request",
          message: "OTP already expired, please request for a new OTP",
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
        status: "Success",
        message: "Account verified successfully",
      });
    } catch (err) {
      return res.status(500).json({
        statusCode: 500,
        status: "Error",
        message: "Internal server error",
        error: err.message,
      });
    }
  },

  changePassword: async function (req, res) {
    try {
      const findUser = await user.findOne({ where: { id: req.user.id } });
      if (findUser) {
        const checkPassword = await comparePassword(
          req.body.oldPassword,
          findUser.password
        );
        if (!checkPassword) {
          res.json({
            statusCode: 404,
            status: "error",
            message: "Invalid Old Password",
          });
        }
        if (!req.body.newPassword || req.body.newPassword.trim() === "") {
          res.json({
            statusCode: 400,
            status: "error",
            message: "New password cannot be empty",
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
              status: "success",
              message: "Password changed successfully",
            });
          }
          if (updateUser == 0) {
            res.json({
              statusCode: 200,
              status: "success",
              message: "Password changed failed",
            });
          }
        }
      } else {
        res.json({
          status: "error",
          statusCode: 404,
          message: "User not found",
        });
      }
    } catch (err) {
      res.json({
        statusCode: 500,
        status: "error",
        message: "Internal server error",
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
          status: "error",
          statusCode: 404,
          message: "Email addres not registered",
        });
        return;
      }
      const transporter = nodemailer.createTransport({
        service: "gmail",
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
            status: "error",
            statusCode: 500,
            message: "Internal Server Error",
          });
          return;
        } else {
          // console.log('Server is ready');
        }
      });
      const token = randtoken.generate(20);
      const mailData = {
        from: "nurhanna9928@mail.com",
        to: req.body.email,
        subject: "Reset Kata Sandi untuk Akun Media Sosial Anda",
        html: `
        <div style="font-family: Arial, sans-serif; background-color: #f5f5f5; padding: 20px; text-align: center;">
        <div style="background-color: #fff; max-width: 500px; margin: 0 auto; padding: 20px; border-radius: 5px; box-shadow: 0 2px 5px rgba(0, 0, 0, 0.1);">
          <h1 style="color: #333;">Reset Password</h1>
          <p style="font-size: 16px;">Hi ${checkUser.fullname} :)</p>
          <p style="font-size: 16px;">You have requested to reset your password for your social media account.</p>
          <a href="${process.env.FE_HOST}/reset/${token}" style="display: inline-block; padding: 12px 24px; background-color: #007bff; color: #fff; text-decoration: none; border-radius: 5px; font-size: 16px; margin-top: 20px;">Reset Password</a>
          <p style="font-size: 16px;">Please note that this link will expire in 2 minutes.</p>
          <p style="font-size: 16px;">Thank you for using our services.</p>
          <p style="font-size: 16px;">Regards, Hanna</p>
        </div>
      </div>
      
        `,
      };

      transporter.sendMail(mailData, function (err, info) {
        if (err) {
          res.json({
            statusCode: 404,
            status: "error",
            message: "An error occurred while sending the email",
          });
          return;
        } else {
          resetPassword_db.create({
            token: token,
            email: req.body.email,
            expired: addMinutesToDate(2),
          });
          res.json({
            statusCode: 200,
            status: "success",
            message:
              "link for reset password already sent successfully,Please check your email",
          });
        }
      });
    } catch (err) {
      res.status(500).json({
        statusCode: 500,
        status: "error",
        message: "Internal server error",
        error: err.message,
      });
      return;
    }
  },

  resetPassword: async (req, res) => {
    try {
      const { password } = req.body;
      const token = req.query.token;
      const findEmail = await resetPassword_db.findOne({
        where: { token: token },
      });
      const findUser = await user.findOne({
        where: { email: findEmail.email },
      });

      if (!findUser) {
        res.status(404).json({
          status: "error",
          statusCode: 404,
          message: "User not found",
        });
        return;
      } else {
        if (!req.body.password || req.body.password.trim() === "") {
          res.status(400).json({
            statusCode: 400,
            status: "error",
            message: "password cannot be empty",
          });
          return;
        }
        // check expired otp (should not more than 2 minutes)
        const currentTime = new Date();
        if (findEmail.expired < currentTime) {
          await resetPassword_db.destroy({
            where: { token: token },
          });
          res.status(400).json({
            statusCode: 400,
            status: "Bad Request",
            message:
              "Link already expired, please request new link for reset password",
          });
          return;
        }
        const affectedRows = user.update(
          { password: await hashPassword(password) },
          {
            where: {
              id: findUser.id,
            },
          }
        );
        if (affectedRows > 0) {
          await resetPassword_db.destroy({
            where: { token: token },
          });
        }
        res.status(200).json({
          status: "success",
          statusCode: 200,
          message: "Password already reset successfully",
        });
      }
    } catch (err) {
      res.status(500).json({
        status: "error",
        statusCode: 500,
        message: "Internal server error",
        error: err.message,
      });
    }
  },
};

export default userController;
