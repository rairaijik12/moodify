const http = require('http');
const app = require('./app');
const db = require('./API/models');
const sqlite3 = require('sqlite3').verbose();
const syncDatabase = require('./sync');
const dbPath = './Moodify.db';
const port1 = 3000; // SQLite
const port2 = 8080; // MySQL

// Function to check if a port is in use
const checkPort = (port, callback) => {
    const server = http.createServer();
    server.listen(port, () => {
        server.close(() => callback(false)); // Port is free
    }).on('error', () => {
        callback(true); // Port is in use
    });
};

// Initialize SQLite database
const db1 = new sqlite3.Database(dbPath, (err) => {
    if (err) {
        console.error('❌ Failed to connect to SQLite database:', err.message);
        process.exit(1);
    } else {
        console.log('🚀 SQLite database connected successfully.');
        syncDatabase(db1, db.sqlite);  // Pass db.sqlite explicitly for SQLite sync
        checkPort(port1, (inUse) => {
            if (!inUse) {
                app.listen(port1, () => console.log(`✅ SQLite Server is running on port ${port1}`));
            } else {
                console.error(`❌ Port ${port1} is already in use!`);
            }
        });
    }
});

// Synchronize MySQL database before starting the server
db.mysql.sync({ alter: false })  // Use db.mysql explicitly for MySQL sync
    .then(() => {
        console.log('🚀 MySQL Cloud Database connected.');
        checkPort(port2, (inUse) => {
            if (!inUse) {
                http.createServer(app).listen(port2, () => console.log(`✅ MySQL Server is running on port ${port2}`));
            } else {
                console.error(`❌ Port ${port2} is already in use!`);
            }
        });
    })
    .catch((err) => {
        console.error('❌ Failed to connect MySQL database:', err);
    });

db.syncAll().then(() => {
}).catch((err) => {
    console.error("❌ Sync Error:", err);
});
