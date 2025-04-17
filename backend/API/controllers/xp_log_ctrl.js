const { XPLog, MoodEntry, ChatSession } = require('../models/'); // Ensure model name matches exported model
const util = require('../../utils');
const { Op } = require("sequelize");
const dayjs = require('dayjs');

const formatDateTime = d => d ? dayjs(d).format('MMM D, YYYY hh:mm A') : 'N/A';

const createXPLog = async (req, res, next) => {
    try {
        const { user_ID, action_type, action_ID } = req.body;

        if (!util.checkMandatoryFields([user_ID, action_type, action_ID])) {
            return res.status(400).json({
                successful: false,
                message: "A mandatory field is missing."
            });
        }

        let xp_earned;
        let actionDate;

        if (action_type === "mood_entry") {
            const moodEntry = await MoodEntry.findByPk(action_ID);
            if (!moodEntry || moodEntry.user_ID !== user_ID) {
                return res.status(400).json({ successful: false, message: "Invalid mood entry ID." });
            }
            xp_earned = 5;
            actionDate = moodEntry.logged_date;
        } else if (action_type === "chat_session") {
            const chatSession = await ChatSession.findByPk(action_ID);
            if (!chatSession || chatSession.user_ID !== user_ID) {
                return res.status(400).json({ successful: false, message: "Invalid chat session ID." });
            }
            xp_earned = 20;
            actionDate = chatSession.createdAt;
        } else {
            return res.status(400).json({ successful: false, message: "Invalid action type. Must be 'mood_entry' or 'chat_session'." });
        }

        const startOfDay = dayjs(actionDate).startOf("day").toDate();
        const endOfDay = dayjs(actionDate).endOf("day").toDate();

        // ✅ Check for existing log of the same type on the same day
        const existingSameTypeLog = await XPLog.findOne({
            where: {
                user_ID,
                action_type,
                createdAt: {
                    [Op.between]: [startOfDay, endOfDay]
                }
            }
        });

        if (existingSameTypeLog) {
            return res.status(400).json({
                successful: false,
                message: `You’ve already earned XP for a '${action_type}' today. Only one log per type per day is allowed.`
            });
        }

        const newLog = await XPLog.create({
            xp_log_ID: nanoid(10),
            user_ID,
            action_type,
            action_ID,
            xp_earned
        });

        return res.status(201).json({
            successful: true,
            message: "XP Log created successfully.",
            data: newLog
        });

    } catch (err) {
        console.error("❌ Error creating XP log:", err);
        return res.status(500).json({
            successful: false,
            message: err.message
        });
    }
};






module.exports = {
    createXPLog

}
