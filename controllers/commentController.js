import { post, comment_db, user, like_db, filedb } from "../database/db.js";
const commentController = {
  createComment: async (req, res) => {
    try {
      const findPost = await post.findOne({ where: { id: req.body.post_id } });
      if (!findPost) {
        res.status(404).json({
          statusCode: 404,
          status: "error",
          message: "No Post found",
        });
        return;
      }
      const post_comment = await comment_db.create({
        post_id: req.body.post_id,
        user_id: req.user.id,
        comment: req.body.comment,
      });
      if (post_comment) {
        const updatedRecord = await post.findOne({
          where: { id: req.body.post_id },
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
        const isLike = updatedRecord.likes.some(
          (like) => like.user_id === req.user.id
        );
        updatedRecord.dataValues.isLike = isLike;

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

        const postUpdatedWithStatus = getPostUpdated.map((post) => {
          const isLike = post.likes.some(
            (like) => like.user_id === req.user.id
          );
          return {
            ...post.toJSON(),
            isLike: isLike,
          };
        });
        res.status(200).json({
          statusCode: 200,
          status: "Success",
          message: "Comment posted successfully",
          data: {
            detail: updatedRecord,
            allPosts: postUpdatedWithStatus,
            targetId: findPost.user_id,
          },
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
  destroyComment: async (req, res) => {
    try {
      const findComment = await comment_db.findByPk(req.params.id);
      if (!findComment) {
        res.status(404).json({
          statusCode: 404,
          status: "error",
          message: "No Comment found",
        });
        return;
      }
      const deleteComment = await comment_db.destroy({
        where: { id: req.params.id },
      });
      if (deleteComment) {
        const updatedRecord = await post.findOne({
          where: { id: findComment.post_id },
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
        const isLike = updatedRecord.likes.some(
          (like) => like.user_id === req.user.id
        );
        updatedRecord.dataValues.isLike = isLike;

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

        const postUpdatedWithStatus = getPostUpdated.map((post) => {
          const isLike = post.likes.some(
            (like) => like.user_id === req.user.id
          );
          return {
            ...post.toJSON(),
            isLike: isLike,
          };
        });
        res.status(200).json({
          statusCode: 200,
          status: "Success",
          message: "Comment delete successfully",
          data: {
            detail: updatedRecord,
            allPosts: postUpdatedWithStatus,
            targetId: updatedRecord.user_id,
          },
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
};
export default commentController;
