const { ALLOWED_EMOTIONS } = require("../../emotion_values");
const { nanoid } = require("nanoid");

module.exports = (sequelize, DataTypes) => {
    const dialect = sequelize.options.dialect; // Get the database dialect
    const sqliteDB = dialect === "sqlite"; // Check if using SQLite

    const MoodEntry = sequelize.define(
        "MoodEntry",
        {
            entry_ID: {
                type: DataTypes.STRING,
                primaryKey: true,
                allowNull: false,
                defaultValue: () => nanoid(8),
            },
            user_ID: {  // Explicitly defining the foreign key
                type: DataTypes.STRING,
                allowNull: false,
                references: {
                    model: "Users",  // Ensure the correct table name
                    key: "user_ID",
                },
                onDelete: "CASCADE",
                onUpdate: "CASCADE",
            },
            mood: {
                type: DataTypes.ENUM("rad", "good", "meh", "bad", "awful"),
                allowNull: false,
            },
            logged_date: {
                type: DataTypes.DATE,
                allowNull: false,
            },
            emotions: {
                type: DataTypes.STRING,
                allowNull: false,
                get() {
                    return this.getDataValue("emotions")?.split(",") || [];
                },
                set(value) {
                    if (!Array.isArray(value)) {
                        throw new Error("Emotions must be an array.");
                    }
                    const validEmotions = value.filter((e) => ALLOWED_EMOTIONS.has(e));
                    if (validEmotions.length === 0) {
                        throw new Error("Invalid emotions provided.");
                    }
                    this.setDataValue("emotions", validEmotions.join(","));
                },
            },
            // Add journalText field only for SQLite
            ...(sqliteDB && {
                journal: {
                    type: DataTypes.TEXT,  // Use TEXT for larger strings
                    allowNull: true, // Allow empty journal entries
                }
            }),
        },
        {
            timestamps: true,  // Let Sequelize handle timestamps automatically
        }
    );

    // Association
    MoodEntry.associate = (models) => {
        MoodEntry.belongsTo(models.User, {
            foreignKey: "user_ID",
            as: "user",
        });
    };

    return MoodEntry;
};
