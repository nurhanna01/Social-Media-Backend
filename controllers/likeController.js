import { post, like_db, user, comment_db, filedb } from "../database/db.js";
const likeController = {
  doLike: async (req, res) => {
    try {
      const like = req.body.like === "true";
      const findPost = await post.findByPk(req.body.post_id);
      if (!findPost) {
        res.status(404).json({
          statusCode: 404,
          status: "error",
          message: "No Post found",
        });
        return;
      }

      if (!like) {
        const findLike = await like_db.findOne({
          where: { post_id: req.body.post_id, user_id: req.user.id },
        });
        if (findLike) {
          const delLike = findLike.destroy();
          if (delLike) {
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
              status: "success",
              message: "Unlike request sent successfully.",
              data: {
                postId: req.body.post_id,
                allPosts: postUpdatedWithStatus,
                targetId: findPost.user_id,
              },
            });
            return;
          }
        }
      }
      const likeToDb = await like_db.create({
        post_id: req.body.post_id,
        user_id: req.user.id,
      });
      if (likeToDb) {
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
          status: "success",
          message: "Like request sent successfully.",
          data: {
            postId: req.body.post_id,
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
};
export default likeController;
