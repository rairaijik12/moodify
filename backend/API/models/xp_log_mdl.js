const { nanoid } = require('nanoid')

module.exports = (sequelize, DataTypes) => {
    const XPLog = sequelize.define('XPLog', {
        xp_log_ID: {
            type: DataTypes.STRING,
            primaryKey: true,
            allowNull: true
        },
        action_type: {
            type: DataTypes.ENUM('mood_entry', 'chat_session'),
            allowNull: false
        },
        action_ID: {
            type: DataTypes.STRING,
            allowNull: false // Stores either mood_entry_ID or chat_session_ID
        },
        xp_earned: {
            type: DataTypes.INTEGER,
            allowNull: false
        },
        timestamp: {
            type: DataTypes.DATE,
            allowNull: false,
            defaultValue: DataTypes.NOW
        }

       
    },

    {
        timelapse:false,
         hooks: {
                    beforeCreate: (user) => {
                        user.user_ID = nanoid(8);
                    }
                }
    }
    
    )


    XPLog.associate = (models) => {
        XPLog.belongsTo(models.User, {
            foreignKey: 'user_ID',
            as: 'user',
            onDelete: 'CASCADE'
        });
    };

    return XPLog;
};
