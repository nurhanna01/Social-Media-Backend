import { post, filedb } from '../database/db.js';
import { user } from '../database/db.js';
import dotenv from 'dotenv';
dotenv.config();

const postController = {
  post: async (req, res) => {
    try {
      const loginUser = await user.findOne({ where: { id: req.user.id } });
      const files = req.files;
      console.log(files, 'files');
      const newPost = {
        description: req.body.description,
        // path: `${req.protocol}://${req.get('host')}/${req.file.filename}`,
        user_id: loginUser.id,
      };
      const postToDb = await post.create(newPost);
      if (postToDb) {
        files.forEach(async (file) => {
          // const filePath = `uploads/${file.filename}`;
          const path = `${req.protocol}://${req.get('host')}/${file.filename}`;
          await filedb.create({ path, post_id: postToDb.id });
        });
      }
      if (postToDb) {
        res.status(201).json({
          statusCode: 201,
          status: 'success',
          message: 'Post created successfully',
          data: postToDb,
        });
      } else {
        res.status(404).json({
          statusCode: 404,
          status: 'error',
          message: 'Post failed to be created',
        });
        return;
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
  getPost: async (req, res) => {
    try {
      const getPost = await post.findAll({
        include: [
          { model: filedb, as: 'files' },
          {
            model: user,
            as: 'user',
            attributes: ['username', 'email', 'fullname', 'active', 'photo_profile_path', 'photo_cover_path'],
          },
        ],
        order: [['createdAt', 'DESC']],
      });
      if (getPost) {
        res.status(200).json({
          statusCode: 200,
          status: 'success',
          message: 'Post retrieved successfully',
          data: getPost,
        });
      } else {
        res.status(404).json({
          statusCode: 404,
          status: 'error',
          message: 'No Post found',
        });
        return;
      }
    } catch (err) {
      res.status(500).json({
        statusCode: 500,
        status: 'error',
        message: 'Internal server error',
        error: err,
      });
    }
  },
};

export default postController;
