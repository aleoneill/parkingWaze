const express = require("express"); 
const app = express(); 
app.engine('html', require('ejs').renderFile); 
app.use(express.static("public"));

app.get("/", function(req, res) {
    res.send("it works!"); 
});

// server listener 
app.listen(process.env.PORT, process.env.IP, function() {
    console.log("Running Express Server..."); 
});
