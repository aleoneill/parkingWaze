const express = require("express"); 
const mysql = require('mysql');
const app = express(); 
app.engine('html', require('ejs').renderFile); 
app.use(express.static("public"));

app.get("/", function(req, res) {
    const connection = mysql.createConnection({
        host: 'mcldisu5ppkm29wf.cbetxkdyhwsb.us-east-1.rds.amazonaws.com',
        user: 'zzrbbsj5791xsnwf',
        password: 'l4kg72cf660m8hya',
        database: 'l2gh8fug1cqr96dc'
    });
    
    res.send("it works!"); 
});

// server listener 
app.listen(process.env.PORT, process.env.IP, function() {
    console.log("Running Express Server..."); 
});
