const { Notification } = require("../models");
const { nanoid } = require("nanoid"); // optional if using string ID
const util = require("../utils/util"); // assuming you use util.checkMandatoryFields()

// Create a notification
const createNotification = async (req, res, next) => {
    try {
        const { user_ID, enable_notif, notification_time_1, notification_time_2 } = req.body;

        if (!util.checkMandatoryFields([user_ID])) {
            return res.status(400).json({
                successful: false,
                message: "A mandatory field is missing."
            });
        }

        const newNotification = await Notification.create({
            user_ID,
            enable_notif,
            notification_time_1,
            notification_time_2
        });

        return res.status(201).json({
            successful: true,
            message: "Notification created successfully.",
            data: newNotification
        });
    } catch (err) {
        console.error(err);
        return res.status(500).json({
            successful: false,
            message: err.message
        });
    }
};

// Read all notifications (or per user)
const getNotif = async (req, res, next) => {
    try {
        const { user_ID } = req.query;

        const condition = user_ID ? { where: { user_ID } } : {};

        const notifications = await Notification.findAll(condition);

        return res.status(200).json({
            successful: true,
            data: notifications
        });
    } catch (err) {
        console.error(err);
        return res.status(500).json({
            successful: false,
            message: err.message
        });
    }
};

// Update notification by notif_ID
const updateNotif = async (req, res, next) => {
    try {
        const { id } = req.params;
        const { enable_notif, notification_time_1, notification_time_2 } = req.body;

        const notif = await Notification.findByPk(id);

        if (!notif) {
            return res.status(404).json({
                successful: false,
                message: "Notification not found."
            });
        }

        await notif.update({
            enable_notif,
            notification_time_1,
            notification_time_2
        });

        return res.status(200).json({
            successful: true,
            message: "Notification updated successfully.",
            data: notif
        });
    } catch (err) {
        console.error(err);
        return res.status(500).json({
            successful: false,
            message: err.message
        });
    }
};



module.exports = {
    createNotif,
    getNotif,
    updateNotif
};
