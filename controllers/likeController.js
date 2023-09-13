import { post, like_db } from '../database/db.js';
const likeController = {
  doLike: async (req, res) => {
    try {
      const like = req.body.like === 'true';
      const findPost = await post.findOne({ id: req.body.post_id });
      if (!findPost) {
        res.status(404).json({
          statusCode: 404,
          status: 'error',
          message: 'No Post found',
        });
        return;
      }
      if (!like) {
        findLike = await like_db.findOne({ where: { post_id: req.body.post_id, user_id: req.body.user_id } });
        findLike.destroy();
        res.status(200).json({
          statusCode: 200,
          status: 'success',
          message: 'Unlike request sent successfully.',
        });
        return;
      }
      const likeToDb = await like_db.create({ post_id: req.body.post_id, user_id: req.body.user_id });
      if (likeToDb) {
        res.status(200).json({
          statusCode: 200,
          status: 'success',
          message: 'Like request sent successfully.',
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
};
export default likeController;
