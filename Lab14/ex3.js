const fs = require('fs');
var express = require('express');
var app = express();

var filename = './user_data.json';

// will return boolean of the existence of the file 
if (fs.existsSync(filename)) {
    var stats = fs.statSync(filename);
    console.log(`${filename} has ${stats.size} characters `);
    //have reg data file so read data and parse into user_reg_info object
    var user_reg_info = require(filename);
    console.log(user_reg_info);
}
else {
    console.log(`${filename} does not exist`);
}




app.use(express.urlencoded({ extended: true }));

app.get("/login", function (request, response) {
    // Give a simple login form
    str = `
<body>
<form action="" method="POST">
<input type="text" name="username" size="40" placeholder="enter username" ><br />
<input type="password" name="password" size="40" placeholder="enter password"><br />
<input type="submit" value="Submit" id="submit">
</form>
</body>
    `;
    response.send(str);
 });

app.post("/login", function (request, response) {
    // Process login form POST and redirect to logged in page if ok, back to login page if not
    let login_username = request.body['username'];
    let login_password = request.body['password'];
    //check if usernane exists, then check if password entered matches password stored
    if(typeof user_reg_info[login_username] != 'undefined'){
        if (user_reg_info[login_username]['password'] == login_password){
            response.send(`${login_username} is logged in`)
        }
        else {
            response.send(`Incorrect password!`)
        }
    } else {
        response.send(`User, ${login_username}, does not exist!`);
    }


});

app.listen(8080, () => console.log(`listening on port 8080`));