const { nanoid } = require('nanoid');

module.exports = (sequelize, DataTypes) => {
    const Feedback = sequelize.define('Feedback', {
        feedback_ID: {
            type: DataTypes.STRING,
            primaryKey: true,
            allowNull: true
        },
        rating: {
            type: DataTypes.ENUM('1', '2', '3', '4', '5'),  // Restricts values to 1-5
            allowNull: false
        },
        
        feedback_time: {
            type: DataTypes.DATE,
            allowNull: false
        }
    },{
        timelapse:false,
         hooks: {
                    beforeCreate: (feedback) => {
                        feedback.feedback_ID = nanoid(8);
                    }
                }
    }
)
        Feedback.associate = (models) => {
            Feedback.belongsTo(models.User, {
                foreignKey: 'user_ID',
                as: 'user'
            });
            Feedback.belongsTo(models.ChatSession, {
                foreignKey: 'chat_session_ID',
                as: 'chat_session'
            });
        };
    

    return Feedback;
};
