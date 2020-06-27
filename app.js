const express = require('express');
const sqlite = require('sqlite3').verbose();
const session = require('express-session');
const { render } = require('ejs');
const { urlencoded } = require('express');

const truncate = require('truncate');



// db database
const db = new sqlite.Database('./database/database.db');

// JSON SETTINGS
const sessionconfig = require('./config/session.json');


app = express();
app.use(express.static('public'));
app.use(urlencoded({extended: false}));


// Session
// Change the session secret key later
app.use(session({
    secret: sessionconfig.secret,
    resave: sessionconfig.resave,
    saveUninitialized: sessionconfig.saveUninitialized
}));

// Login system
app.get('/login', (req, res) => {
    if (req.session.loggedin)
    {
        res.redirect('/');
    } else {
        res.render('login.ejs', {verified: req.session.loggedin});
    }
});


app.post('/auth', (req, res) => {

    var username = req.body.username;
    var password = req.body.password;
    db.all(
        "SELECT username, password FROM accounts WHERE username = ? AND password = ?",
        [username, password],
        (error, results) => {
            if (results.length > 0) {
                req.session.loggedin = true;
				req.session.username = username;
				res.redirect('/');
            } else {
                res.send('Incorrect password or username');
            }

            console.log(results)
        }
    );
});


app.get('/logout', (req, res) => {
    req.session.loggedin = false;
    req.session.username = null;
    res.redirect('/');
});

app.get('/user', (req, res) => {
    if (req.session.loggedin) {
        res.send(req.session.username);
    } else {
        res.redirect('/login');
    }
});



// Index page
app.get('/', (req, res) => {
    db.all(
        'SELECT rowid, * FROM posts',
        (error, results) => {
            res.render('index.ejs', {posts: results, verified: req.session.loggedin, Truncate: truncate});
        }
    );
});

// Edit page
app.get('/edit/:id', (req, res) => {
    if (req.session.loggedin) {
        db.all(
            'SELECT rowid, * FROM posts WHERE rowid = ?',
            [req.params.id],
            (error, results) => {
                res.render('edit.ejs', {post: results[0], verified: req.session.loggedin});
            }
        );
    }
});

app.post('/update/:id', (req, res) => {
    if (req.session.loggedin) {
        db.all(
            'UPDATE posts SET title = ?, content = ? WHERE rowid = ?',
            [req.body.title, req.body.content, req.params.id],
            (error, results) => {
                res.redirect('/');
            }
        );
    }
});

// Delete
app.get('/delete/:id' , (req, res) => {
    if (req.session.loggedin) {
        db.all(
            'DELETE FROM posts WHERE rowid = ?',
            [req.params.id],
            (error, results) => {
                res.redirect('/');
            }
        );
    } else {
        res.send('something went wrong !');
    }
});


app.get('/new', (req, res) => {
    
    if(req.session.loggedin) {
        res.render('new.ejs', {verified: req.session.loggedin});
    } else {
        res.redirect('/login');
    }
});

app.post('/new', (req, res) => {
    db.all(
        "INSERT INTO posts(title, content, post_date) VALUES(?, ?, DATETIME('now'))",
        [req.body.title, req.body.content],
        (error, results) => {
            res.redirect('/');
        }
    );
});

app.get('/post/:id', (req, res) => {
    db.all(
        'SELECT rowid, * FROM posts WHERE rowid = ?',
        [req.params.id],
        (error, results) => {
            res.render('read.ejs', {post: results[0], verified: req.session.loggedin});
        }
    );
});



app.listen(3000);