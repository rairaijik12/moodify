const { nanoid } = require('nanoid')

module.exports = (sequelize, DataTypes) => {
    const XPProgress = sequelize.define('XPProgress', {
        xp_progress_ID: {
            type: DataTypes.STRING,
            primaryKey: true,
            allowNull: true
        },
        gained_xp: {
            type: DataTypes.INTEGER,
            allowNull: false
        },
        gained_xp_date: {
            type: DataTypes.DATE,
            allowNull: false
        }
    }, {
        timelapse:false,
         hooks: {
                    beforeCreate: (xpProgress) => {
                        xpProgress.xp_progress_ID = nanoid(8);
                    }
                }
    })

    XPProgress.associate = (models) => {
        XPProgress.belongsTo(models.User, {
            foreignKey: 'user_ID',
            as: 'user'
        });
        
    };

    return XPProgress;
};
