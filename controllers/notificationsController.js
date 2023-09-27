import { notification_db, user } from "../database/db.js";
const notificationController = {
  createNotifications: async (req, res) => {
    try {
      const findSender = await user.findOne({ where: { id: req.user.id } });
      const findLike = await notification_db.findOne({
        where: { post_id: req.body.post_id, user_sender: req.user.id },
      });
      if (findLike) {
        res.status(200).json({
          statusCode: 200,
          status: "success",
          message: "Notifications already exist.",
        });
        return;
      }
      const createNotif = await notification_db.create({
        user_sender: req.user.id,
        user_receiver: req.body.user_receiver,
        post_id: req.body.post_id,
        text: findSender.fullname + " " + req.body.text,
      });
      if (createNotif) {
        res.status(200).json({
          statusCode: 200,
          status: "success",
          message: "Notifications sent successfully.",
        });
      } else {
        res.status(400).json({
          statusCode: 400,
          status: "error",
          message: "Bad Request!",
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
  getNotifications: async (req, res) => {
    try {
      const notifications = await notification_db.findAll({
        where: {
          user_receiver: req.user.id,
        },
        include: [
          {
            model: user,
            as: "senderUser",
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
        order: [["createdAt", "DESC"]],
      });
      if (!notifications) {
        res.status(404).json({
          statusCode: 404,
          status: "Not Found",
          message: "Notificatons not found",
        });
        return;
      }
      res.status(200).json({
        statusCode: 200,
        status: "success",
        message: "Notifications get successfully.",
        data: notifications,
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
  readNotification: async (req, res) => {
    try {
      const findNotification = await notification_db.findOne({
        where: { id: req.params.id },
      });
      if (!findNotification) {
        res.status(404).json({
          statusCode: 404,
          status: "error",
          message: "Notification not found",
        });
        return;
      }
      await notification_db.update(
        { isSeen: true },
        { where: { id: req.params.id } }
      );
      const dataToReturn = await notification_db.findAll({
        where: { user_receiver: req.user.id },
        include: [
          {
            model: user,
            as: "senderUser",
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
        order: [["createdAt", "DESC"]],
      });
      res.status(200).json({
        statusCode: 200,
        status: "success",
        message: "Read notification were updated successfully",
        data: dataToReturn,
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

  readAllUnreadNotifications: async (req, res) => {
    try {
      const notifications = await notification_db.findAll({
        where: {
          user_receiver: req.user.id,
        },
        include: [
          {
            model: user,
            as: "senderUser",
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
        order: [["createdAt", "DESC"]],
      });
      await notification_db.update(
        { isSeen: true },
        { where: { user_receiver: req.user.id, isSeen: false } }
      );

      res.status(200).json({
        statusCode: 200,
        status: "success",
        message:
          "All unread notifications have been marked as read successfully",
        data: notifications,
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
export default notificationController;
