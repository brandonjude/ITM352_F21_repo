//Express server for website
//Brandon Jude Marcos

//load the express module 
var express = require('express');

//assign the express method to the app variable
var app = express();

//load the file system module
const fs = require('fs');

//save path to user_data.json to variable user_data_file
user_data_file = './user_data.json';

//set the initial state of user logged in to be false
user_logged_in = false;

//pulling data from product_data_.json and assigning to products_array
var products_array = require('./product_data_.json')



var session = require('express-session');

app.use(session({ secret: "MySecretKey", resave: true, saveUninitialized: true }));


//parsing incoming request bodies, accessible through request.body
app.use(express.urlencoded({ extended: true }));


app.use(express.json())

//route for all methods and paths
app.all('*', function (request, response, next) {
    console.log(request.method + ' to path ' + request.path + " query " + JSON.stringify(request.body[`quantity_textbox`]));

    if (typeof request.session.cart == 'undefined') {
        request.session.cart = {};
    }


    next();
});

// check for the existence of the user_data.json file
if (fs.existsSync(user_data_file)) {
    //load the contents of the user_data.json file into user_reg_info variable
    user_reg_info = require(user_data_file);
}
//if file does not exits, alert console of missing file 
else {
    console.log(`${filename} does not exist`);

}



app.post("/add_to_cart", function (request, response, next) {
    console.log(request.body)

    var quantity_desired = request.body['quantity'];
    var product_key = request.body['product_type'];


    var errors = {};
    //validate quantities 
    for (i in products_array[product_key]) {
        let q = quantity_desired[i];
        if (isNonNegInt(q) == false) {
            errors[`quantity_${i}`] = `${q} is not a valid quantity`;
        } else {
            if (q > products_array[product_key][i]['quantity_available']){
                errors[`quantity_${i}`] = 'Quantity exceeds inventory!'
            }
        }
    }

    //if there are no errors, add item to cart
    if (Object.keys(errors).length == 0) {
        if (typeof request.session.cart == 'undefined') {
            request.session.cart = {};
        }
        if (typeof request.session.cart[product_key] == 'undefined') {
            request.session.cart[product_key] = new Array(quantity_desired.length).fill(0);
        }
        for (i in request.session.cart[product_key]) {
            request.session.cart[product_key][i] += Number(quantity_desired[i]);

        }

    }
    console.log('cart data: ', request.session.cart);
    request.body.errors = JSON.stringify(errors);

    let params = new URLSearchParams(request.body);

    response.redirect(`./products_display.html?${params.toString()}`);


});





//route for post requests to try_login, route requested when login page submitted
app.post("/try_login", function (request, response, next) {
    //pull the username and password from the request body of login page
    user_username = request.body[`username`].toLowerCase(); //set the username to all lowercase letters, case insensitive username
    user_password = request.body[`password`]; //password remains case sensitive

    //if the typeof request.session['username'] != 'undefined'
    //then user is already signed in
    //else 
    //if the user validates their credentials correctly
    //request.session['username'] = user_username
    //request.session['email'] = user_reg_info[user_username].email

    //validation code taken from Lab 14
    //if the username does not exits in the user_data.json file
    if (user_reg_info[user_username] == undefined) {
        //redirect back to login page an alert user does not exits
        response.redirect(`./login.html?non_existent_user=${user_username}`);
        //else if user does exist within user_data file
    } else if (user_reg_info[user_username] != undefined) {
        //if the password does not match the usernames password key 
        if (user_reg_info[user_username].password != user_password) {
            //redirect back to login page and alert user of incorrect password
            response.redirect(`./login.html?wrong_password=${user_username}`);
            // else if username and password match
        } else if (user_reg_info[user_username].password == user_password) {
            //set the state of user logged in to true
            user_logged_in = true;

            request.session['username'] = user_username;
            request.session['email'] = user_reg_info[user_username].email;
            request.session['full_name'] = user_reg_info[user_username].name;
            console.log(request.session);
            if (Object.keys(request.session.cart).length == 0){
                response.redirect(`./products_display.html?product_type=Fruits`);
            } else {
                response.redirect(`./shopping_cart.html`);
            }
            
            
        }
    }
});


//route for post request for try_register, requested by registration page 
app.post("/try_register", function (request, response, next) {

    //save username, password, email, and fullname from request body into variables
    //save username to lowercase letters for case insensitivity
    new_user_username = request.body[`new_username`].toLowerCase();
    new_user_password = request.body[`new_password`];
    new_user_repeat_password = request.body[`repeat_new_password`];
    new_user_email = request.body[`new_email`].toLowerCase(); //set username to lowercase for case insensitivity
    new_user_fullname = request.body[`new_full_name`];
    //initialize an errors object with 0 errors
    var errors = {};
    //regex to check for illegal characters
    // regex found https://stackoverflow.com/questions/56532904/what-is-the-regex-for-finding-special-characters-and-whitespace-at-the-beginning
    var illegal_char = /[!@#$%^&*()_+\-=\[\]{};':"\\|,.<>\/? ]+/;
    var illegal_char_name = /[!@#$%^&*()_+\-=\[\]{};':"\\|,.<>\/?]+/;
    //regex to check for numbers 
    // regex found at https://dev.to/melvin2016/how-to-check-if-a-string-contains-at-least-one-number-using-regular-expression-regex-in-javascript-3n5h
    var number_char = /\d/;
    //begin secondary validation of registration information
    //if the registration username has special characters, is less than 4 characters, or greater than 10 characters
    if (illegal_char.test(new_user_username) == true || new_user_username.length < 4 || new_user_username.length > 10) {
        //push a username error into the errors object
        errors['username_error'] = 'username_error';
    }
    //if username already exists within the user_data file
    if (user_reg_info[new_user_username] != undefined) {
        //push user already exists error into errors array
        errors['user_already_exists'] = 'user_already_exists';
        //initialize a variable that will load a parameter to alert for pre-existing user
        var user_exists_str = '&user_exists';
    }
    //else if user does not already exists
    else {
        //parameter will be loaded as an empty string
        var user_exists_str = '';
    }
    //if password length is less than 6 characters
    if (new_user_password.length < 6) {
        errors['password_error'] = 'password_error';
    }
    //if the password and confirmation password do not match
    if (new_user_repeat_password != new_user_password) {
        errors['repeat_password_error'] = 'repeat_password_error';
    }
    //if email does not follow structure determined by the regex
    // regex found at https://www.w3resource.com/javascript/form/email-validation.php
    if (/^\w+([\.-]?\w+)*@\w+([\.-]?\w+)*(\.\w{2,3})+$/.test(new_user_email) == false) {
        errors['email_error'] = 'email_error';
    }
    //if the full name contains special characters or numbers
    if (illegal_char_name.test(new_user_fullname) == true || number_char.test(new_user_fullname) == true) {
        errors['fullname_error'] = 'fullname_error';
    }
    console.log(`Caught errors: ${JSON.stringify(errors)}`);
    // if errors exists within the registration information, if errors have been pushed into errors object
    if (Object.keys(errors).length > 0) {
        request.body.errors = JSON.stringify(errors);
        //create a URL parameter that contains all request body information and errors object
        let params = new URLSearchParams(request.body);
        //redirect back to the register page with registration information and errors in the parameters
        response.redirect(`./register.html?${params.toString() + user_exists_str}`);
    }
    // else if no errors exists within the registration information
    else {
        //create a new key in the user_data.json file with the username
        user_reg_info[new_user_username] = {};
        //add the password, email, and fullname values to the username key
        user_reg_info[new_user_username].password = new_user_password;
        user_reg_info[new_user_username].email = new_user_email;
        user_reg_info[new_user_username].name = new_user_fullname;

        //writing to user_data.json file code taken from Lab 14
        //stringify the existing data and new data that was added to the user_data object
        new_data = JSON.stringify(user_reg_info);
        //re-write the data the user_data.json file
        fs.writeFileSync('./user_data.json', new_data);
        


        request.session['username'] = new_user_username;
        request.session['email'] = new_user_email;
        request.session['full_name'] = new_user_fullname;
            console.log(`Session data after registering: ${request.session}`);
            if (typeof request.session.cart[0] == 'undefined'){
                response.redirect(`./products_display.html?product_type=Fruits`);
            } else {
                response.redirect(`./shopping_cart.html`);
            }

    }

});




//route for a GET request of product_data.js 
app.get("/product_data.js", function (request, response, next) {
    response.type('.js');
    //send a stringified version of the products_array object
    var products_str = `var products_array = ${JSON.stringify(products_array)};`;
    response.send(products_str);
});



//route for GET requests for /product_data_quantity.js
app.get("/session_data.js", function (request, response, next) {
    response.type('.js');
    // quantity_arr = request.body[`quantity_textbox`];
    //allow access to the quantity_arr array object 
    if (typeof request.session.cart == 'undefined'){
        request.session.cart = {};
    }
    var products_qty_str = `var cart_data = ${JSON.stringify(request.session.cart)}; var user = ${JSON.stringify(request.session.username)};  var full_name = ${JSON.stringify(request.session.full_name)};`;
    //send the quantity_arr array object 
    response.send(products_qty_str);
});


//route to check for get requests to invoice.html file
app.get("/invoice.html", function (request, response, next) {
    //if the user has not successfully logged in but tries to access invoice
    if (!user_logged_in) {
        //redirect back to the login page with query string to alert user to sign in first
        response.redirect('./login.html?please_sign_in');
    }
    next();
});


/* app.get("/shopping_cart.html", function (request, response, next) {
    //if the user has not successfully logged in but tries to access invoice
    if (Object.keys(request.session.cart).length == 0){
        response.redirect(`./products_display.html?product_type=Fruits&no_items_in_cart`);
    } else {
        response.redirect(`./shopping_cart.html`); 
    }
});

 */
app.get("/logout", function (request, response, next) {
    //if the user has not successfully logged in but tries to access invoice
    request.session.destroy();
    console.log(request.session);
    response.redirect('./');
});



//this is for updating the cart, overwrite cart session
app.post("/update_cart", function (request, response, next) {

    console.log(request.body);
    //validate the quantities are available
    //validate valid quantities 
    //check if quantities available 
    for (let pkey in request.session.cart) {
        for (let i in request.session.cart[pkey]) {
            if (request.session.cart[pkey][i] == 0){
                continue;
            } 
            request.session.cart[pkey][i] = Number(request.body[`cart_update_${pkey}_${i}`]);
        }
    }
    console.log(request.body.cart);
    console.log(request.session.cart);
    response.redirect('./shopping_cart.html');
});

//default route into the ./public directory for any route that was not previously specified
app.use(express.static('./public'));

//listen for requests on port 8080
app.listen(8080, () => console.log(`Listening on port 8080`)); // note the use of an anonymous function here to do a callback



// returns false if q is not an whole integer or positive number
function isNonNegInt(q) {

    if (q == "") {
        q = 0;
    }
    if (Number(q) != q) {
        return false;
    }
    else if (q < 0) {
        return false;
    }
    else if (parseInt(q) != q) {
        return false;
    }

    return true;
}