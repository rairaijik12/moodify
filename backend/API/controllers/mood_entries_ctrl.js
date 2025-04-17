const { MoodEntry } = require('../models/'); // Ensure model name matches exported model
const util = require('../../utils');
const { Op } = require("sequelize");
const { ALLOWED_EMOTIONS} = require('../../emotion_values');
const dayjs = require('dayjs');
const customParseFormat = require('dayjs/plugin/customParseFormat');
dayjs.extend(customParseFormat);



const addMoodEntry = async (req, res, next) => {
    try {
        const { user_ID, mood, emotions, logged_date, journal } = req.body;

        // Validate mandatory fields
        if (!util.checkMandatoryFields([user_ID, mood, emotions, logged_date])) {
            return res.status(400).json({
                successful: false,
                message: "A mandatory field is missing."
            });
        }

        // Validate and parse date with time using dayjs
        const providedDate = dayjs(logged_date, 'MM-DD-YYYY HH:mm', true);
        if (!providedDate.isValid()) {
            return res.status(400).json({
                successful: false,
                message: 'Invalid date format. Use MM-DD-YYYY HH:mm.'
            });
        }

        const now = dayjs();

        // Prevent logging for today or a future date
        if (providedDate.isSame(now, 'day') || providedDate.isAfter(now)) {
            return res.status(400).json({
                successful: false,
                message: "You cannot log a mood for today or a future date."
            });
        }

        // Check if an entry already exists for this user on the same day
        const existingEntry = await MoodEntry.findOne({
            where: {
                user_ID,
                logged_date: {
                    [Op.gte]: providedDate.startOf('day').toDate(),
                    [Op.lt]: providedDate.endOf('day').toDate()
                }
            }
        });

        if (existingEntry) {
            return res.status(400).json({
                successful: false,
                message: "You have already logged a mood for this date."
            });
        }

        // Limit emotions to a maximum of 3
        if (!Array.isArray(emotions) || emotions.length > 3) {
            return res.status(400).json({
                successful: false,
                message: "You can log up to 3 emotions only."
            });
        }

        // Create new mood entry with the full timestamp
        const newMoodEntry = await MoodEntry.create({
            user_ID,
            mood,
            emotions,
            logged_date: providedDate.toDate(),
            ...(journal && { journal })
        });

        return res.status(201).json({
            successful: true,
            message: "Successfully added new mood.",
            moodEntry: {
                entry_ID: newMoodEntry.entry_ID,
                user_ID: newMoodEntry.user_ID,
                mood: newMoodEntry.mood,
                logged_date: dayjs(newMoodEntry.logged_date).format("YYYY-MM-DD HH:mm"),
                emotions: newMoodEntry.emotions,
                ...(journal && { journal })
            }
        });

    } catch (err) {
        console.error("❌ Error in adding a mood:", err);
        return res.status(500).json({
            successful: false,
            message: err.message || "An unexpected error occurred."
        });
    }
};


const getAllEntries = async (req, res, next) => {
    try {
        const moodEntries = await MoodEntry.findAll();

        if (!moodEntries || moodEntries.length === 0) {
            return res.status(200).json({
                successful: true,
                message: "No mood entries found.",
                count: 0,
                data: []
            });
        }

        const formattedEntries = moodEntries.map(entry => ({
            ...entry.toJSON(),
            logged_date: dayjs(entry.logged_date).format("MM-DD-YYYY HH:mm")
        }));

        return res.status(200).json({
            successful: true,
            message: "Retrieved all mood entries.",
            data: formattedEntries.length,
            formattedEntries
        });

    } catch (err) {
        return res.status(500).json({
            successful: false,
            message: err.message
        });
    }
};

const getEntriesByUId = async (req, res, next) => {
    try {
        const { user_ID } = req.params;

        // Fetch mood entries filtered by user_ID
        const moodEntries = await MoodEntry.findAll({
            where: { user_ID }
        });

        if (!moodEntries || moodEntries.length === 0) {
            return res.status(200).json({
                successful: true,
                message: "No mood entries found for this user.",
                count: 0,
                data: []
            });
        }

        // Format logged_date
        const data = moodEntries.map(entry => {
            const entryData = entry.toJSON();
            entryData.logged_date = dayjs(entryData.logged_date).format("MM-DD-YYYY HH:mm");
            return entryData;
        });

        return res.status(200).json({
            successful: true,
            message: "Retrieved all mood entries of the user.",
            count: data.length,
            data
        });

    } catch (err) {
        return res.status(500).json({
            successful: false,
            message: err.message
        });
    }
};



const updateEntryById = async (req, res, next) => {
    try {
        const { mood, emotions, logged_date } = req.body;

        // Check if the mood entry exists
        const moodEntry = await MoodEntry.findByPk(req.params.id);
        if (!moodEntry) {
            return res.status(404).json({
                successful: false,
                message: "Mood entry not found."
            });
        }

        // Prepare the update data (only include fields that exist in req.body)
        const updateData = {};
        if (mood !== undefined) updateData.mood = mood;
        if (emotions !== undefined) updateData.emotions = emotions;
        if (logged_date !== undefined) {
            // Prevent updating to a future date
            const providedDate = new Date(logged_date);
            providedDate.setHours(0, 0, 0, 0);

            const today = new Date();
            today.setHours(0, 0, 0, 0);

            if (providedDate > today) {
                return res.status(400).json({
                    successful: false,
                    message: "You cannot update the mood entry to a future date."
                });
            }
            updateData.logged_date = logged_date;
        }

        // Check if there's something to update
        if (Object.keys(updateData).length === 0) {
            return res.status(400).json({
                successful: false,
                message: "No valid fields provided for update."
            });
        }

        if (!Array.isArray(emotions) || emotions.length > 3) {
            return res.status(400).json({
                successful: false,
                message: "You can log up to 3 emotions only."
            });
        }

        // Update the mood entry
        await moodEntry.update(updateData);

        return res.status(200).json({
            successful: true,
            message: "Mood entry updated successfully.",
            updatedFields: updateData
        });

    } catch (err) {
        console.error("Error in updateEntryById:", err);
        return res.status(500).json({
            successful: false,
            message: err.message || "An unexpected error occurred."
        });
    }
};


// const updateEmotionbyId = async (req, res, next) => {
//     try {
//         const { emotions } = req.body;

//         // Check if the mood entry exists
//         const moodEntry = await MoodEntry.findByPk(req.params.id);
//         if (!moodEntry) {
//             return res.status(404).json({
//                 successful: false,
//                 message: "Mood entry not found."
//             });
//         }

//         // Validate mandatory fields
//         if (!util.checkMandatoryFields([emotions])) {
//             return res.status(400).json({
//                 successful: false,
//                 message: "A mandatory field is missing."
//             });
//         }

//         // Update mood entry data
//         await moodEntry.update({
//             emotions,
//         });

//         return res.status(200).json({
//             successful: true,
//             message: "Mood entry updated successfully."
//         });

//     } catch (err) {
//         console.error(err);
//         return res.status(500).json({
//             successful: false,
//             message: err.message
//         });
//     }
// };



const deleteMoodEntry = async (req, res) => {
    try {
        const entryId = req.params.id;

        const moodEntry = await MoodEntry.findByPk(entryId);

        if (!moodEntry) {
            return res.status(404).json({
                successful: false,
                message: "Mood entry not found.",
            });
        }

        await moodEntry.destroy();

        return res.status(200).json({
            successful: true,
            message: `Mood entry with ID ${entryId} has been deleted.`,
        });
    } catch (error) {
        console.error(error);
        return res.status(500).json({
            successful: false,
            message: `Error deleting mood entry: ${error.message}`,
        });
    }
};


module.exports = {
    addMoodEntry,
    getEntriesByUId,
    getAllEntries,
    updateEntryById,
    deleteMoodEntry
};
