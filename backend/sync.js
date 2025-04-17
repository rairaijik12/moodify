const db = require("../backend/API/models/index");

module.exports = async function syncDatabase() {
  try {
    // Ensure User model exists for SQLite

  
    // Fetch data from SQLite
    const rows = await db.User.sqlite.findAll({
      raw: true,
      attributes: ["user_ID", "nickname", "createdAt", "updatedAt"],
    });

    if (!rows || rows.length === 0) {
      console.log("⚠️ No data found in SQLite to sync.");
      return;
    }

    for (const row of rows) {
      try {
        console.log(`🔄 Syncing user ${row.user_ID}: ${row.nickname}`);
        
        // Ensure MySQL query only runs if dialect is MySQL
        if (db.mysql.getDialect() === "mysql") {
          await db.User.mysql.upsert({
            user_ID: row.user_ID,
            nickname: row.nickname,
            createdAt: row.createdAt,
            updatedAt: row.updatedAt
          });

          console.log(`✅ Synced user ${row.user_ID}`);
        } else {
          console.log(`⚠️ Skipping MySQL sync because detected dialect is "${db.mysql.getDialect()}"`);
        }
      } catch (queryError) {
        console.error(`❌ Error inserting user ${row.user_ID}:`, queryError);
      }
    }

  } catch (error) {
    console.error("❌ Syncing of data :", error);
  }
};
