const { nanoid } = require('nanoid');


module.exports = (sequelize, DataTypes) => {
    const ChatSession = sequelize.define('ChatSession', {
        chat_session_ID: {
            type: DataTypes.STRING,
            primaryKey: true,
            allowNull: true
        },
        start_time: {
            type: DataTypes.DATE,
            allowNull: false
        },
        end_time: {
            type: DataTypes.DATE,
            allowNull: false
        },

        isActive: {
            type:DataTypes.INTEGER
        }
    },{
    timelapse: false,
    hooks: {
        beforeCreate: (chatSession) => {
            chatSession.chat_session_ID = nanoid(8);
        }
    }
    }
)
        ChatSession.associate = (models) => {
            ChatSession.belongsTo(models.User, {
                foreignKey: 'user_ID',
                as: 'user'
            });

            
            
    } 
    
    return ChatSession;
    
};
