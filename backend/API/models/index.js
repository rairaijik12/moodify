"use strict";

const fs = require("fs");
const path = require("path");
const Sequelize = require("sequelize");
require("dotenv").config();

const config = require("../config/config.json");

const sqliteConfig = config["development"];
const mysqlConfig = config["production"];

if (!sqliteConfig || !sqliteConfig.dialect) {
  throw new Error("❌ SQLite config is missing or incorrect.");
}
if (!mysqlConfig || !mysqlConfig.dialect) {
  throw new Error("❌ MySQL config is missing or incorrect.");
}

// Initialize Sequelize instances
const sqlite = new Sequelize({
  dialect: sqliteConfig.dialect,
  storage: sqliteConfig.storage,
  logging: console.log
});

const mysql = new Sequelize(
  mysqlConfig.database,
  mysqlConfig.username,
  mysqlConfig.password,
  {
    host: mysqlConfig.host,
    dialect: mysqlConfig.dialect,
    port: mysqlConfig.port,
    logging: console.log
  }
);

const db = {};

// Load and initialize all models for both SQLite and MySQL
fs.readdirSync(__dirname)
  .filter((file) => file.endsWith(".js") && file !== "index.js")
  .forEach((file) => {
    const defineModel = require(path.join(__dirname, file));

    const sqliteModel = defineModel(sqlite, Sequelize.DataTypes);
    const mysqlModel = defineModel(mysql, Sequelize.DataTypes);

    db[sqliteModel.name] = sqliteModel; // For SQLite
    db[`mysql_${mysqlModel.name}`] = mysqlModel; // For MySQL

    

  });

// Setup associations for both databases
Object.entries(db).forEach(([name, model]) => {
  if (typeof model.associate === "function") {
    model.associate(db);
  }
});

// Attach Sequelize instances
db.sqlite = sqlite;
db.mysql = mysql;
db.Sequelize = Sequelize;

// Default db.sequelize should not be overwritten, so it's better to explicitly call `db.syncAll()` for each instance.
db.syncAll = async () => {
  try {
    // Sync SQLite database
    await sqlite.sync({ alter: false });
    console.log("✅ SQLite activated.");

    // Sync MySQL database
    await mysql.sync({ alter: false });
    console.log("✅ MySQL activated.");
  } catch (err) {
    console.error("❌ Sync Error:", err);
  }
};

module.exports = db;
