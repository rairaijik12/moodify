const { nanoid } = require("nanoid");

module.exports = (sequelize, DataTypes) => {
    const dialect = sequelize.options.dialect;
    const sqliteDB = dialect === "sqlite";
    const mysqlDB = dialect === "mysql";

    const User = sequelize.define("User", {
        user_ID: {
            type: DataTypes.STRING,
            primaryKey: true,
            allowNull: true,
        },
        nickname: {
            type: DataTypes.STRING,
            allowNull: false,
            validate: {
                notEmpty: { msg: "Nickname is required." },
            },
        },
        ...(sqliteDB && {
            passcode: {
                type: DataTypes.INTEGER,
                allowNull: true,
                validate: {
                    isInt: { msg: "Passcode must be a number." },
                },
            },
        }),
        createdAt: {
            type: DataTypes.DATE,
            defaultValue: sqliteDB
                ? DataTypes.NOW
                : mysqlDB
                ? sequelize.literal("CURRENT_TIMESTAMP")
                : null,
        },
        updatedAt: {
            type: DataTypes.DATE,
            defaultValue: sqliteDB
                ? DataTypes.NOW
                : mysqlDB
                ? sequelize.literal("CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP")
                : null,
        },
    }, {
        timestamps: true,
        hooks: {
            beforeCreate: (user) => {
                if (!user.user_ID) {
                    user.user_ID = nanoid(8);
                }
            },
        },
    });

    User.associate = (models) => {
        User.hasMany(models.MoodEntry, {
            foreignKey: "user_ID",
            as: "moodEntries",
            onDelete: "CASCADE",
            onUpdate: "CASCADE",
        });

        User.hasOne(models.XPProgress, {
            foreignKey: "user_ID",
            as: "xpProgress",
            onDelete: "SET NULL",
            onUpdate: "CASCADE",
        });

        User.hasMany(models.XPLog, {
            foreignKey: "user_ID",
            as: "xpLog",
            onDelete: "SET NULL",
            onUpdate: "CASCADE",
        });

        User.hasMany(models.XPInfo, {
            foreignKey: "user_ID",
            as: "xpTbl",
            onDelete: "SET NULL",
            onUpdate: "CASCADE",
        });

        User.hasMany(models.Feedback, {
            foreignKey: "user_ID",
            as: "feedback",
            onDelete: "SET NULL",
            onUpdate: "CASCADE",
        });

        User.hasMany(models.ChatSession, {
            foreignKey: "user_ID",
            as: "chatSession",
            onDelete: "SET NULL",
            onUpdate: "CASCADE",
        });
    };

    return User;
};
