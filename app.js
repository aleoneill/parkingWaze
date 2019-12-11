const express = require("express");
const mysql = require('mysql');
const cookieParser = require('cookie-parser');
const session = require('express-session');
const app = express();

app.use(express.json());
app.use(express.urlencoded({ extended: false }));
app.use(cookieParser());

// view engine setup
app.engine('html', require('ejs').renderFile);
app.use(express.static("public"));

app.set('trust proxy', 1); // trust first proxy
app.use(session({
    secret: 'password'
}));

app.get('/', function(req, res, next) {
    res.render("login.html");
});

app.post('/', function(req, res, next) {
    // check database if username and password are correct
    const connection = mysql.createConnection({
        host: 'mcldisu5ppkm29wf.cbetxkdyhwsb.us-east-1.rds.amazonaws.com',
        user: 'zzrbbsj5791xsnwf',
        password: 'l4kg72cf660m8hya',
        database: 'l2gh8fug1cqr96dc'
    });

    connection.connect();

    connection.query(
        `SELECT username, password FROM users
         WHERE username = '${req.body.username}' and password = '${req.body.password}' `,
        function(error, results, fields) {
            if (error) throw error;

            // if there are no results, username and password are incorrect
            if(!results.length) {
                connection.end();
                delete req.session.username;
                res.json({
                    successful: false,
                    message: 'Wrong username or password'
                });
            } else {
                connection.end();
                req.session.username = req.body.username;
                res.json({
                    successful: true,
                    message: ''
                });
            }
        }
    );
});

app.get('/gmap', function(req, res, next) {
    const connection = mysql.createConnection({
        host: 'mcldisu5ppkm29wf.cbetxkdyhwsb.us-east-1.rds.amazonaws.com',
        user: 'zzrbbsj5791xsnwf',
        password: 'l4kg72cf660m8hya',
        database: 'l2gh8fug1cqr96dc'
    });

    connection.connect();
    connection.end();

    if (req.session && req.session.username && req.session.username.length) {
        res.render('guestmap.html');
    }
    else {
        delete req.session.username;
        res.redirect('/');
    }
});

app.post('/gmap', function(req, res, next) {
    const connection = mysql.createConnection({
        host: 'mcldisu5ppkm29wf.cbetxkdyhwsb.us-east-1.rds.amazonaws.com',
        user: 'zzrbbsj5791xsnwf',
        password: 'l4kg72cf660m8hya',
        database: 'l2gh8fug1cqr96dc'
    });
    connection.connect();

    connection.query(
        `SELECT closest_lot, 2nd_closest, 3rd_closest FROM buildings
         WHERE number = '${req.body.building}'`

    );
});

app.get('/new', function(req, res) {
    res.render("new.html");
});

app.post('/new', function(req, res, next) {
    const connection = mysql.createConnection({
        host: 'mcldisu5ppkm29wf.cbetxkdyhwsb.us-east-1.rds.amazonaws.com',
        user: 'zzrbbsj5791xsnwf',
        password: 'l4kg72cf660m8hya',
        database: 'l2gh8fug1cqr96dc'
    });

    connection.connect();

    connection.query(
        `SELECT username, email FROM users
        WHERE username = '${req.body.username}' or email = '${req.body.email}' `,
        function(error, results, fields) {
            if (error) throw error;

            // if there are no results it means there are no accounts with
            // the username or email in the database
            // insert new users
            if(!results.length) {
                connection.query(
                    `INSERT INTO users
                    (username, email, password, fullname)
                    VALUES ('${req.body.username}', '${req.body.email}', 
                    '${req.body.password}', '${req.body.fullName}')`,
                    function(error, results, fields) {
                        if (error) throw error;
                        else connection.end();

                        req.session.username = req.body.username;
                        res.json({
                            successful: true,
                            message: ''
                        });
                    }
                );
            } else {
                // this means that there is already a user with the same username or email
                connection.end();
                res.json({
                    successful: false,
                    message: 'Invalid: username, or email already in use'
                });
            }
        }
    );
});

app.get('/user', function(req, res) {
    if (req.session && req.session.username && req.session.username.length) {
        res.render('user.html');
    }
    else {
        delete req.session.username;
        res.redirect('/');
    }
});

// app.listen("5000", "0.0.0.0", function() {
//         console.log("Express Server is Running...")
// console.log("Express Server is Running...")
// });

// server listener - heroku ready
app.listen(process.env.PORT, process.env.IP, function() {
    console.log("Running Express Server...");
});