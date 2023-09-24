import { post, filedb, like_db, comment_db } from "../database/db.js";
import { user } from "../database/db.js";
import dotenv from "dotenv";
dotenv.config();

const postController = {
  post: async (req, res) => {
    try {
      const loginUser = await user.findOne({ where: { id: req.user.id } });
      const files = req.files;
      console.log(files, "files");
      const newPost = {
        description: req.body.description,
        // path: `${req.protocol}://${req.get('host')}/${req.file.filename}`,
        user_id: loginUser.id,
      };
      const postToDb = await post.create(newPost);
      if (postToDb) {
        files.forEach(async (file) => {
          // const filePath = `uploads/${file.filename}`;
          const path = `${req.protocol}://${req.get("host")}/${file.filename}`;
          await filedb.create({ path, post_id: postToDb.id });
        });
      }
      // success and return updated data
      const getPostUpdated = await post.findAll({
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
          {
            model: comment_db,
            as: "comments",

            include: [
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
            ],
          },
        ],
        order: [
          ["createdAt", "DESC"],
          [comment_db, "createdAt", "DESC"],
        ],
      });

      const postStatus = getPostUpdated.map((post) => {
        const isLike = post.likes.some((like) => like.user_id === req.user.id);
        return {
          ...post.toJSON(),
          isLike: isLike,
        };
      });
      if (postToDb) {
        res.status(201).json({
          statusCode: 201,
          status: "success",
          message: "Post created successfully",
          data: postStatus,
        });
      } else {
        res.status(404).json({
          statusCode: 404,
          status: "error",
          message: "Post failed to be created",
        });
        return;
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
  getPost: async (req, res) => {
    try {
      const getPost = await post.findAll({
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
          {
            model: comment_db,
            as: "comments",

            include: [
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
            ],
          },
        ],
        order: [
          ["createdAt", "DESC"],
          [comment_db, "createdAt", "DESC"],
        ],
      });

      const postStatus = getPost.map((post) => {
        const isLike = post.likes.some((like) => like.user_id === req.user.id);
        return {
          ...post.toJSON(),
          isLike: isLike,
        };
      });
      if (getPost) {
        res.status(200).json({
          statusCode: 200,
          status: "success",
          message: "Post retrieved successfully",
          data: postStatus,
        });
      } else {
        res.status(404).json({
          statusCode: 404,
          status: "error",
          message: "No Post found",
        });
        return;
      }
    } catch (err) {
      res.status(500).json({
        statusCode: 500,
        status: "error",
        message: "Internal server error",
        error: err,
      });
    }
  },
  detailPost: async (req, res) => {
    try {
      const detail = await post.findOne({
        where: { id: req.params.id },
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
          {
            model: comment_db,
            as: "comments",
            include: [
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
            ],
          },
        ],
        order: [
          ["createdAt", "DESC"],
          [comment_db, "createdAt", "DESC"],
        ],
      });

      const isLike = detail.likes.some((like) => like.user_id === req.user.id);
      detail.dataValues.isLike = isLike;

      if (detail) {
        res.status(200).json({
          statusCode: 200,
          status: "success",
          message: "Post retrieved successfully",
          data: detail,
        });
      } else {
        res.status(404).json({
          statusCode: 404,
          status: "error",
          message: "No Post found",
        });
        return;
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
  deletePost: async (req, res) => {
    try {
      const findPost = await post.findOne({ where: { id: req.params.id } });
      if (!findPost) {
        res.status(404).json({
          statusCode: 404,
          status: "error",
          message: "No Post found",
        });
        return;
      }
      if (findPost.user_id !== req.user.id) {
        res.status(403).json({
          statusCode: 403,
          status: "Forbidden",
          message: "Access to this resource is restricted.",
        });
        return;
      }
      await post.destroy({ where: { id: req.params.id } });

      // success and return updated data
      const getPostUpdated = await post.findAll({
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
          {
            model: comment_db,
            as: "comments",

            include: [
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
            ],
          },
        ],
        order: [
          ["createdAt", "DESC"],
          [comment_db, "createdAt", "DESC"],
        ],
      });

      const postStatus = getPostUpdated.map((post) => {
        const isLike = post.likes.some((like) => like.user_id === req.user.id);
        return {
          ...post.toJSON(),
          isLike: isLike,
        };
      });
      res.status(200).json({
        statusCode: 200,
        status: "Success",
        message: "Post delete successfully",
        data: postStatus,
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
};

export default postController;
