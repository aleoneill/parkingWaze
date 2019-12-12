const express = require("express");
const path = require('path');
const mysql = require('mysql');
const cookieParser = require('cookie-parser');
const session = require('express-session');
const app = express();

app.use(express.json());
app.use(express.urlencoded({ extended: false }));
app.use(cookieParser());

// view engine setup
app.set('views', path.join(__dirname, 'views'));
app.set('view engine', 'ejs');
app.set('view engine', 'hbs');
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
    const connection = mysql.createConnection({
        host: 'mcldisu5ppkm29wf.cbetxkdyhwsb.us-east-1.rds.amazonaws.com',
        user: 'zzrbbsj5791xsnwf',
        password: 'l4kg72cf660m8hya',
        database: 'l2gh8fug1cqr96dc'
    });

    connection.connect();

    // CHECKING IS USERNAME AND PASSWORD ARE CORRECT 
    connection.query(
        `SELECT username, password FROM users
         WHERE username = '${req.body.username}' and password = '${req.body.password}' `,
        function(error, results, fields) {
            if (error) throw error;

            // IF THERE ARE NO RESULTS, EITHER WRONG USERNAME/PASSWORD OR DOESNT EXIST
            if(!results.length) {
                connection.end();
                delete req.session.username;
                
                // RETURN BACK RESULTS - FALSE 
                res.json({
                    successful: false,
                    message: 'Wrong username/password or account does not exist'
                });
            } else {
                connection.end();
                req.session.username = req.body.username;
                
                // RETURN BACK RESULTS - TRUE
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
    
    // IF SESSION IS VALID 
    if (req.session && req.session.username && req.session.username.length) {
        // GETTING A LIST OF THE BUILDINGS FROM THE DATABASE TO PRELOAD A DROP DOWN 
        connection.query(
            `SELECT number, name FROM buildings 
            ORDER BY name`, 
            function(error, results, fields) {
                if (error) throw error;
                
                // RENDERING HBS WITH RESULTS SENT TO FILE 
                res.render('guestmap.hbs', {
                    results: results
                });
            }    
        ); 
    } else {
        // THIS MEANS THEY TRIED TYING IN THE URL /GMAP WITHOUT GOING TO LOG IN 
        delete req.session.username;
        res.redirect('/');
    }
    
    connection.end(); 
});

app.post('/gmap', function(req, res, next) {
    const connection = mysql.createConnection({
        host: 'mcldisu5ppkm29wf.cbetxkdyhwsb.us-east-1.rds.amazonaws.com',
        user: 'zzrbbsj5791xsnwf',
        password: 'l4kg72cf660m8hya',
        database: 'l2gh8fug1cqr96dc'
    });
    
    connection.connect();
    
    // GETTING THE LOTS CLOSEST TO THE BUILDING OF THEIR NEXT CLASS 
    connection.query(
        `SELECT lot1, lot2, lot3 FROM buildings
         WHERE number = '${req.body.building}' `,
        function(error, results, fields) {
        if (error) throw error;
            res.json({
                successful: true,
                lots: results
            });  
        }
    );

    connection.end(); 
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

    // CHECKING IF USERNAME OR EMAIL ALREADY EXISTS 
    connection.query(
        `SELECT username, email FROM users
        WHERE username = '${req.body.username}' or email = '${req.body.email}' `,
        function(error, results, fields) {
            if (error) throw error;
            
            // IF THERE ARE NO RESULTS, USERNAME/EMAIL AREN'T IN THE DATABASE 
            // CREATE A NEW USER 
            if(!results.length) {
                connection.query(
                    `INSERT INTO users
                    (username, email, password, fullname)
                    VALUES ('${req.body.username}', '${req.body.email}', 
                    '${req.body.password}', '${req.body.fullName}')`,
                    function(error, results, fields) {
                        if (error) throw error;
                        
                        connection.end();
                        req.session.username = req.body.username;
                        res.json({
                            successful: true,
                            message: ''
                        });
                    }
                );
            } else {
                // USERNAME OR PASSWORD ALREADY EXISTS IN DATABASE 
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
    const connection = mysql.createConnection({
        host: 'mcldisu5ppkm29wf.cbetxkdyhwsb.us-east-1.rds.amazonaws.com',
        user: 'zzrbbsj5791xsnwf',
        password: 'l4kg72cf660m8hya',
        database: 'l2gh8fug1cqr96dc'
    });
    connection.connect();
    //console.log(req.session.username);
    connection.query(`SELECT * from schedule WHERE userid = '${req.session.username}'`,
        function (error, results, fields) {
            if (error) throw error;
            //console.log(results);
            res.render('user.hbs', {
                class: results
            });
            connection.end();
        });
});

app.post('/user', function(req, res) {
    const connection = mysql.createConnection({
        host: 'mcldisu5ppkm29wf.cbetxkdyhwsb.us-east-1.rds.amazonaws.com',
        user: 'zzrbbsj5791xsnwf',
        password: 'l4kg72cf660m8hya',
        database: 'l2gh8fug1cqr96dc'
    });
    connection.connect();


    //console.log(req.body.name);
    connection.query(`INSERT INTO schedule VALUES ('${req.session.username}', '${req.body.time}', '${req.body.name}', '${req.body.location}')`,
        function(error, results) {
            if (error) throw error;
            //console.log(req.body);
            res.render('user.hbs', {
                class: results
            });
        });
    connection.end();
});

// app.listen("5000", "0.0.0.0", function() {
//         console.log("Express Server is Running...");
// });

// // server listener - heroku ready
app.listen(process.env.PORT, process.env.IP, function() {
    console.log("Running Express Server...");
});