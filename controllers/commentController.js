import { post, comment_db } from '../database/db.js';
const commentController = {
  createComment: async (req, res) => {
    try {
      const findPost = await post.findOne({ where: { id: req.body.post_id } });
      if (!findPost) {
        res.status(404).json({
          statusCode: 404,
          status: 'error',
          message: 'No Post found',
        });
        return;
      }
      const post_comment = await comment_db.create({
        post_id: req.body.post_id,
        user_id: req.user.id,
        comment: req.body.comment,
      });
      if (post_comment) {
        res.status(200).json({
          statusCode: 200,
          status: 'Success',
          message: 'Comment posted successfully',
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
  destroyComment: async (req, res) => {
    try {
      const findPost = await post.findOne({ where: { id: req.params.id } });
      if (!findPost) {
        res.status(404).json({
          statusCode: 404,
          status: 'error',
          message: 'No Post found',
        });
        return;
      }
      const deletePost = await post.destroy({ where: { id: req.params.id } });
      if (deletePost) {
        res.status(200).json({
          statusCode: 200,
          status: 'Success',
          message: 'Comment delete successfully',
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
export default commentController;
