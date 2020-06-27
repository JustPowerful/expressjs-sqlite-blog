const sqlite = require('sqlite3').verbose();

const db = new sqlite.Database('./database/database.db');

// db.all("CREATE TABLE posts (title varchar(255) NOT NULL,content varchar(3000) DEFAULT NULL,post_date date DEFAULT NULL)", (error, results) => {
    
// })