module.exports = (sequelize, DataTypes) => {
    const Notification = sequelize.define("Notification", {
      notif_ID: {
        type: DataTypes.INTEGER,
        autoIncrement: true,
        primaryKey: true // iniisip ko pa if lalagyan ng nanoid
      },

      enable_notif: {
        type: DataTypes.BOOLEAN,
        allowNull: false,
        defaultValue: true
      },

      notification_time_1: {
        type: DataTypes.TIME,
        allowNull: true
      },
      
      notification_time_2: {
        type: DataTypes.TIME,
        allowNull: true
      }
    });
  
    Notification.associate = (models) => {
      Notification.belongsTo(models.User, {
        foreignKey: "user_ID",
        as: "user",
        onDelete: "CASCADE",
        onUpdate: "CASCADE"
      });
    };
  
    return Notification;
  };
  