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
    delete req.session.username;
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
            `SELECT number, buildingname FROM buildings 
            ORDER BY buildingname`, 
            function(error, results, fields) {
                if (error) throw error;
                connection.end(); 

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
    `SELECT buildingname, lot1, lot2, lot3 FROM buildings
    WHERE number = '${req.body.buildingNumber}'` , 
    function(error, results, fields) {
        if (error) throw error;
        
        connection.end(); 
        res.json({
            successful: true, 
            user: req.session.username,
            results: results 
        }); 
    }); 
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
        function (error, results, fields) {
            if (error) throw error;

            // IF THERE ARE NO RESULTS, USERNAME/EMAIL AREN'T IN THE DATABASE
            // CREATE A NEW USER
            if(!results.length) {
                connection.query(
                    `INSERT INTO users
                    (username, email, password, fullname)
                    VALUES ('${req.body.username}', '${req.body.email}', 
                    '${req.body.password}', '${req.body.fullName}')`,
                    function (error, results, fields) {
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
    
    // TO DISPLAY USER'S CURRENT SCHEDULE 
    if (req.session && req.session.username && req.session.username.length) {
        connection.query(
        `SELECT schedule.time, schedule.name, buildings.buildingname 
        FROM schedule 
        INNER JOIN buildings
        ON schedule.location=buildings.number
        WHERE schedule.userid = '${req.session.username}'`, function (error, results, fields) {
            if (error) throw error;
            
            connection.query( 
            `SELECT number, buildingname FROM buildings 
            ORDER BY buildingname`, function (error, results2, fields) {
                if (error) throw error;
                connection.end();
            
                res.render('user.hbs', {
                    class: results, 
                    buildings: results2
                });
            }); 
        });
    } else {
        delete req.session.username;
        res.redirect('/');
    }
});

app.post('/user', function(req, res) {
    const connection = mysql.createConnection({
        host: 'mcldisu5ppkm29wf.cbetxkdyhwsb.us-east-1.rds.amazonaws.com',
        user: 'zzrbbsj5791xsnwf',
        password: 'l4kg72cf660m8hya',
        database: 'l2gh8fug1cqr96dc'
    });
    connection.connect();
    
    // IS USER WANTS TO DELETE A CLASS 
    if(req.body.deleteClass) {
        connection.query(
        `DELETE FROM schedule
        WHERE userid = '${req.session.username}' and name = '${req.body.deleteClass}'`, function(error, results) {
            // IF NO ROWS WERE AFFECTED, CLASS DOES NOT EXIST TO USERNAME  
            if(results.affectedRows == 0){
                connection.end(); 
                
                res.json({
                    successful: false, 
                    message: "Incorrect class name"
                });
            } else {
                // CLASS EXISTS AND WAS DELETED 
                connection.end(); 
                
                res.json({
                    successful: true
                });
            }
        }); 
    } else {
        // WE ARE ADDING A NEW CLASS TO THE SCHEDULE 
        connection.query(
        `INSERT INTO schedule
        (userid, time, name, location)
        VALUES ('${req.session.username}', '${req.body.time}', 
        '${req.body.name}', '${req.body.location}')`, function(error, results) {
            if (error) throw error;
            connection.end(); 
            
            res.json({
                successful: true
            });
        });
    }
});

app.get('/edit', function(req, res) {
    if (req.session && req.session.username && req.session.username.length) {
        res.render('edit.hbs'); 
    } else {
        delete req.session.username;
        res.redirect('/');
    }
});

app.post('/edit', function(req, res) {
    const connection = mysql.createConnection({
        host: 'mcldisu5ppkm29wf.cbetxkdyhwsb.us-east-1.rds.amazonaws.com',
        user: 'zzrbbsj5791xsnwf',
        password: 'l4kg72cf660m8hya',
        database: 'l2gh8fug1cqr96dc'
    });
    
    connection.connect();
    
    connection.query(
    `SELECT password FROM users
    WHERE username = '${req.session.username}'`, function(error, result) {
        if(error) throw error; 
        
        if(result[0].password != req.body.oldPassword) {
            connection.end(); 
            
            res.json({
                successful: false, 
                message: "<br><br>Incorrect old password"
            }); 
        } else if(result[0].password == req.body.newPassword) {
            connection.end(); 
            
            res.json({
                successful: false, 
                message: "<br><br>New password is the same as old password"
            });
        } else {
            connection.query(
            `UPDATE users 
            SET password = '${req.body.newPassword}'
            WHERE username = '${req.session.username}'`, function(error, results) {
                if (error) throw error; 
                connection.end();
                
                res.json({
                    successful: true
                });
            }); 
        }
    }); 
});

app.get('/umap', function(req, res, next) {
    if (req.session && req.session.username && req.session.username.length) {
    var today = new Date();
    var time = today.getHours() + ":" + today.getMinutes() + ":" + today.getSeconds();
    console.log("the time is.....", time); 

    const connection = mysql.createConnection({
        host: 'mcldisu5ppkm29wf.cbetxkdyhwsb.us-east-1.rds.amazonaws.com',
        user: 'zzrbbsj5791xsnwf',
        password: 'l4kg72cf660m8hya',
        database: 'l2gh8fug1cqr96dc'
    });
    connection.connect();

    connection.query(
    `SELECT * FROM schedule as s 
    left join buildings as b on s.location = b.number 
    where s.userId = '${req.session.username}' and s.time > '${time}' order by s.time limit 1`,
        function (error, results) {
            if (error) throw error;
            connection.end();
            
            console.log(results); 
            console.log(req.session.username); 
            res.render('umap.hbs', {
                nextClass: results
            });
        });
    } else {
        delete req.session.username;
        res.redirect('/');
    }
});

// app.post('/umap', function(req, res, next) {
//     const connection = mysql.createConnection({
//         host: 'mcldisu5ppkm29wf.cbetxkdyhwsb.us-east-1.rds.amazonaws.com',
//         user: 'zzrbbsj5791xsnwf',
//         password: 'l4kg72cf660m8hya',
//         database: 'l2gh8fug1cqr96dc'
//     });
//
//     connection.connect();
//
//     // GETTING THE LOTS CLOSEST TO THE BUILDING OF THEIR NEXT CLASS
//     connection.query(
//         `SELECT lot1, lot2, lot3 FROM buildings
//     WHERE number = '${req.body.buildingNumber}'` ,
//         function(error, results, fields) {
//             if (error) throw error;
//
//             connection.end();
//             res.json({
//                 successful: true,
//                 results: results
//             });
//         });
// });

app.listen("5000", "0.0.0.0", function() {
        console.log("Express Server is Running...");
});

// server listener - heroku ready
app.listen(process.env.PORT, process.env.IP, function() {
    console.log("Running Express Server...");
});