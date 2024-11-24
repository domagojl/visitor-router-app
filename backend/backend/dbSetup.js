const sqlite3 = require('sqlite3').verbose();




const db = new sqlite3.Database('./db/visitorRouter.db', (err) => {
    if (err) {
        console.error('Error opening database', err);
    } else {
        db.run(`
            CREATE TABLE IF NOT EXISTS configurations (
                id TEXT PRIMARY KEY,
                base_url TEXT NOT NULL,
                redirects TEXT NOT NULL,
                created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
            )
        `, (err) => {
            if (err) {
                console.error('Error creating table', err);
            } else {
                console.log('Database initialized');
            }
        });
    }
});

db.run(`
    CREATE TABLE IF NOT EXISTS users (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        email TEXT UNIQUE NOT NULL,
        password TEXT NOT NULL,
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
    )
`, (err) => {
    if (err) {
        console.error('Error creating users table', err);
    } else {
        console.log('Users table created or already exists.');
    }
});

module.exports = db;
