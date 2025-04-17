module.exports = (sequelize, DataTypes) => {
    const XPInfo = sequelize.define('XPInfo', {
        xp_ID: {
            type: DataTypes.INTEGER,
            primaryKey: true,  
            autoIncrement: true, 
            allowNull: false
        },
        xp_feature: {
            type: DataTypes.ENUM(
                'palette set',
                'emoji set ',
                'moodi accessories'
            ),
            allowNull: false
        },
        xp_value_feature: {
            type: DataTypes.INTEGER,
            allowNull: false
        }
    }, {
        timestamps: false // Fixed incorrect key name from "timelapse" to "timestamps"
    });

    // Ensure that XPInfo.associate is inside the module.exports function
    XPInfo.associate = (models) => {
        XPInfo.belongsTo(models.User, {
            foreignKey: 'user_ID',
            as: 'user'
        });
    };

    return XPInfo;
};
