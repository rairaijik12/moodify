const { XPProgress, XPLog } = require('../models/'); // Ensure model name matches exported model
const { Op } = require("sequelize");
const util = require('../../utils');
const dayjs = require("dayjs");

const createXPProgress = async (req, res) => {
    try {
        const { user_ID, date } = req.body;

        if (!user_ID || !date) {
            return res.status(400).json({
                successful: false,
                message: "user_ID and date are required."
            });
        }

        const startOfDay = dayjs(date).startOf("day").toDate();
        const endOfDay = dayjs(date).endOf("day").toDate();

        // Fetch XP logs for the given user on the specified day
        const xpLogs = await XPLog.findAll({
            where: {
                user_ID,
                createdAt: {
                    [Op.between]: [startOfDay, endOfDay]
                }
            }
        });

        if (!xpLogs || xpLogs.length === 0) {
            return res.status(404).json({
                successful: false,
                message: "No XP logs found for the user on this date."
            });
        }

        // Calculate total XP earned
        const totalXP = xpLogs.reduce((acc, log) => acc + log.xp_earned, 0);

        // Create the XPProgress entry
        const newXPProgress = await XPProgress.create({
            user_ID,
            gained_xp: totalXP,
            gained_xp_date: startOfDay
        });

        return res.status(201).json({
            successful: true,
            message: "XP Progress created successfully.",
            data: newXPProgress
        });

    } catch (err) {
        console.error("❌ Error creating XPProgress:", err);
        return res.status(500).json({
            successful: false,
            message: err.message
        });
    }
};

module.exports = {
    createXPProgress
};
