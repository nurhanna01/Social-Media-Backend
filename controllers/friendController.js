import { user, friend } from '../database/db.js';
import { Op } from 'sequelize';
const friendController = {
  getFriends: async function (req, res) {
    try {
      const userId = req.user.id;
      const friends = await friend.findAll({
        where: {
          [Op.or]: [
            { user_ask: userId, status: true },
            { user_receive: userId, status: true },
          ],
        },
        include: [
          {
            model: user,
            as: 'askedUser',
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
          },
          {
            model: user,
            as: 'receivedUser',
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
          },
        ],
      });
      if (friends) {
        res.status(200).json({
          statusCode: 200,
          status: 'success',
          data: friends,
        });
      } else {
        res.status(404).json({
          statusCode: 404,
          status: 'error',
          message: 'Friends not found',
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

  askFriend: async (req, res) => {
    try {
      const userId = req.user.id; // ID pengguna yang sedang masuk
      const targetUserId = req.body.id; // ID pengguna tujuan permintaan pertemanan

      // Cek apakah pengguna sedang masuk dan tujuan permintaan pertemanan adalah pengguna yang sama
      if (userId === targetUserId) {
        return res.status(400).json({
          statusCode: 400,
          status: 'error',
          message: 'You cannot send a friend request to yourself.',
        });
      }

      // Cek apakah permintaan pertemanan sudah ada antara kedua pengguna
      const existingRequest = await friend.findOne({
        where: {
          [Op.or]: [
            { user_ask: userId, user_receive: targetUserId },
            { user_ask: targetUserId, user_receive: userId },
          ],
        },
      });

      if (existingRequest) {
        return res.status(400).json({
          statusCode: 400,
          status: 'error',
          message: 'A friend request has already been sent or received.',
        });
      }

      // Buat entri permintaan pertemanan baru dalam tabel friend
      await friend.create({
        user_ask: userId,
        user_receive: targetUserId,
        status: false, // Set status ke false karena ini adalah permintaan yang belum disetujui
      });

      res.status(200).json({
        statusCode: 200,
        status: 'success',
        message: 'Friend request sent successfully.',
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

  responseFriend: async (req, res) => {
    console.log(req.body);
    try {
      console.log(req.body.request_id);
      const userId = req.user.id;
      const requestId = req.body.request_id;
      const accept = req.body.accept === 'true';

      const friendRequest = await friend.findOne({
        where: {
          id: requestId,
          status: false,
        },
      });

      if (!friendRequest) {
        return res.status(404).json({
          statusCode: 404,
          status: 'error',
          message: 'Friend request not found or already accepted/rejected.',
        });
      }

      if (!accept) {
        const res = await friend.destroy({
          where: {
            id: requestId,
          },
        });
      } else {
        const res = await friend.update(
          { status: true },
          {
            where: {
              id: requestId,
            },
          }
        );
      }

      res.status(200).json({
        statusCode: 200,
        status: 'success',
        message: 'Friend request has been ' + (accept ? 'accepted' : 'rejected') + '.',
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

  getReceivedFriendRequests: async (req, res) => {
    try {
      const userId = req.user.id;

      const friendRequests = await friend.findAll({
        where: {
          user_receive: userId,
          status: false,
        },
        include: [
          {
            model: user,
            as: 'askedUser',
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
          },
        ],
      });

      res.status(200).json({
        statusCode: 200,
        status: 'success',
        data: friendRequests,
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

  deleteFriend: async (req, res) => {
    try {
      const userId = req.user.id;
      const friendId = req.params.id;

      const friendship = await friend.findOne({
        where: {
          [Op.or]: [
            { user_ask: userId, user_receive: friendId, status: true },
            { user_ask: friendId, user_receive: userId, status: true },
          ],
        },
      });

      if (!friendship) {
        return res.status(404).json({
          statusCode: 404,
          status: 'error',
          message: 'Friendship not found.',
        });
      }

      await friendship.destroy();

      res.status(200).json({
        statusCode: 200,
        status: 'success',
        message: 'Friendship has been deleted.',
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
};

export default friendController;
