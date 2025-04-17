const sqlite3 = require('sqlite3').verbose();
const util = require('../../utils');
const { nanoid } = require('nanoid');
const { User } = require("../models"); // Adjust the path based on your project structure



const db = new sqlite3.Database ('Moodify.db');

const addUser = async (req, res) => {
    try {
        const { nickname } = req.body;

        // Validate mandatory fields
        if (!nickname) {
            return res.status(400).json({
                successful: false,
                message: "A mandatory field is missing."
            });
        }

        const userId = nanoid(8); // Generate unique user_ID
        const createdAt = new Date().toISOString(); // Get current timestamp
        const updatedAt = createdAt; // Set updatedAt to same value as createdAt

        // Insert user into SQLite
        db.run(
            `INSERT INTO Users (user_ID, nickname, createdAt, updatedAt) VALUES (?, ?, ?, ?)`,
            [userId, nickname, createdAt, updatedAt],
            function (err) {
                if (err) {
                    console.error("❌ Error adding user:", err.message);
                    return res.status(500).json({
                        successful: false,
                        message: "Database error: " + err.message
                    });
                }

                // Return successful response
                return res.status(201).json({
                    successful: true,
                    message: "Successfully added new user.",
                    user: { user_ID: userId, nickname }
                });
            }
        );
    } catch (err) {
        console.error("❌ Error in adding a user:", err);
        return res.status(500).json({
            successful: false,
            message: err.message || "An unexpected error occurred."
        });
    }
};

const setPasscode = async (req, res, next) => {
    try {
        const { passcode } = req.body;

        // Check if the user exists
        const user = await User.findByPk(req.params.id);
        if (!user) {
            return res.status(404).json({
                successful: false,
                message: "User not found."
            });
        }

        // Validate mandatory fields
        if (!util.checkMandatoryFields([passcode])) {
            return res.status(400).json({
                successful: false,
                message: "A mandatory field is missing."
            });
        }

        // Check if passcode is exactly 4 digits (including leading zeros)
        const passcodeStr = passcode.toString();
        const isValid = /^\d{4}$/.test(passcodeStr);
        if (!isValid) {
            return res.status(400).json({
                successful: false,
                message: "Passcode must be exactly 4 digits"
            });
        }

        // Update user passcode
        await user.update({
            passcode: parseInt(passcodeStr)
        });

        return res.status(200).json({
            successful: true,
            message: "User passcode updated successfully.",
            data: "Updated Passcode: " + passcodeStr
        });

    } catch (err) {
        console.error(err);
        return res.status(500).json({
            successful: false,
            message: err
        });
    }
};



const getUserById = async (req, res, next) => {
    try {
        // Find user by primary key (id) using Sequelize
        const user = await User.findByPk(req.params.id);

        if (!user) {
            res.status(404).send({
                successful: false,
                message: "User not found"
            });
        }
        else {
            res.status(200).send({
                successful: true,
                message: "Retrieved user.",
                data: user
            });
        }
    } catch (err) {
        res.status(500).send({
            successful: false,
            message: err.message
        });
    }
};

const checkUserExists = async (req, res, next) => {
    try {
        const users = await User.findOne();

        if (!users) {
            return res.status(404).json({
                successful: false,
                exists: false,
                message: "No user exists on this device."
            });
        }

        return res.status(200).json({
            successful: true,
            exists: true,
            message: "A user already exists on this device.",
            data: users
        });

    } catch (err) {
        console.error(err);
        return res.status(500).json({
            successful: false,
            message: "Failed to check user existence.",
            error: err.message
        });
    }
};





const getAllUsers = async (req, res, next) => {
    // console.log(db.User + "boink"); // Should not be undefined

    

    try {
        const users = await User.findAll();


        if (!users || users.length === 0) {
            return res.status(200).json({
                successful: true,
                message: "No user found.",
                count: 0,
                data: [],
            });
        }

        res.status(200).send({
            successful: true,
            message: "Retrieved all users.",
            data: users
        });

    } catch (err) {
        res.status(500).send({
            successful: false,
            message: err.message
        });
    }
    
}

const updateUserById = async (req, res, next) => {
    try {
        const { nickname } = req.body;

        // Check if the user exists
        const user = await User.findByPk(req.params.id);
        if (!user) {
            return res.status(404).json({
                successful: false,
                message: "User not found."
            });
        }

        // Validate mandatory fields
        if (!util.checkMandatoryFields([nickname])) {
            return res.status(400).json({
                successful: false,
                message: "A mandatory field is missing."
            });
        }
        // Update user data
        await user.update({
           nickname
        });

        return res.status(200).json({
            successful: true,
            message: "User updated successfully.",
            data: " Updated Nickname: " + nickname
        });

    } catch (err) {
        console.error(err);
        return res.status(500).json({
            successful: false,
            message: err
        });
    }
}

const deleteUser = async (req, res) => {

    try {
        const userId = req.params.id;

        const user = await User.findByPk(userId);

        if (!user) {
            return res.status(404).json({
                successful: false,
                message: "User not found.",
            });
        }

        await user.destroy();

        return res.status(200).json({
            successful: true,
            message: `User with ID ${userId} has been deleted.`,
        });
    } catch (error) {
        console.error(error);
        return res.status(500).json({
            successful: false,
            message: `Error deleting user: ${error}`,
        });
    }
};



module.exports = {
    addUser,
    setPasscode,
    getUserById,
    checkUserExists,
    getAllUsers,
    updateUserById,
    deleteUser
}









