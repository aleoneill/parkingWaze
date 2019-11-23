const express = require("express");
const mysql = require('mysql');
const session = require('express-session');
const app = express();

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
    
    // TODO: replace with MySQL SELECT and hashing/salting...
    // Hey Monica, this is what im having trouble with... req.body does not work 
    // it was working on my in class example but I'm not sure what's the problem 
    console.log("Req body...", req.body.username); 
    if (req.params.username === 'hello' && req.params.password === 'world') {
        successful = true;
        req.session.username = req.params.username; 
    } else {
        // delete the user as punishment!
        delete req.session.username;
        message = 'Wrong username or password!'
    }
    
    // Return success or failure
    res.json({
        successful: successful,
        message: message
    });// Do something to login... 
});

app.get('/map', function(req, res, next) {
    // const connection = mysql.createConnection({
    //     host: 'mcldisu5ppkm29wf.cbetxkdyhwsb.us-east-1.rds.amazonaws.com',
    //     user: 'zzrbbsj5791xsnwf',
    //     password: 'l4kg72cf660m8hya',
    //     database: 'l2gh8fug1cqr96dc'
    // });
    
    // connection.connect();
    // connection.end(); 
    
    if (req.session && req.session.username && req.session.username.length) {
        res.render('map.html');
    }
    else {
        delete req.session.username;
        // res.redirect('/'); COMMENTING OUT SO PEOPLE CAN STILL GO TO /MAP WITHOUT BEING REDIRECTED
    }
});

// server listener 
app.listen(process.env.PORT, process.env.IP, function() {
    console.log("Running Express Server...");
});
