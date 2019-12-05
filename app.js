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
    let successful = false;
    let message = '';
    
    if (req.body.username === 'hello' && req.body.password === 'world') {
        successful = true;
        req.session.username = req.body.username; 
    } else {
        // delete the user as punishment!
        delete req.session.username;
        message = 'Wrong username or password!'
    }
    
    // Return success or failure
    res.json({
        successful: successful,
        message: message
    });
});

app.get('/map', function(req, res, next) {
    const connection = mysql.createConnection({
        host: 'mcldisu5ppkm29wf.cbetxkdyhwsb.us-east-1.rds.amazonaws.com',
        user: 'zzrbbsj5791xsnwf',
        password: 'l4kg72cf660m8hya',
        database: 'l2gh8fug1cqr96dc'
    });
    
    connection.connect();
    connection.end(); 
    
    if (req.session && req.session.username && req.session.username.length) {
        res.render('map.html');
    }
    else {
        delete req.session.username;
        res.redirect('/');
    }
});

// running server
// app.listen("5000", "0.0.0.0", function() {
//     console.log("Express Server is Running...")
// });

// server listener
app.listen(process.env.PORT, process.env.IP, function() {
    console.log("Running Express Server...");
});
