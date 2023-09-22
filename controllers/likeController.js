import { post, like_db, user, comment_db, filedb } from "../database/db.js";
const likeController = {
  doLike: async (req, res) => {
    try {
      const like = req.body.like === "true";
      const findPost = await post.findOne({ id: req.body.post_id });
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
        const delLike = findLike.destroy();
        if (delLike) {
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
          res.status(200).json({
            statusCode: 200,
            status: "success",
            message: "Unlike request sent successfully.",
            data: updatedRecord,
          });
          return;
        }
      }
      const likeToDb = await like_db.create({
        post_id: req.body.post_id,
        user_id: req.user.id,
      });
      if (likeToDb) {
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

        res.status(200).json({
          statusCode: 200,
          status: "success",
          message: "Like request sent successfully.",
          data: updatedRecord,
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
