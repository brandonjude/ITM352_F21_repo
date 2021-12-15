//Express server for website
//Brandon Jude Marcos

//load the express module 
var express = require('express');

//assign the express method to the app variable
var app = express();

//load the file system module
const fs = require('fs');

//load the nodemailer module
const nodemailer = require('nodemailer');

//save path to user_data.json to variable user_data_file
user_data_file = './user_data.json';

//pulling data from product_data_.json and assigning to products_array
var products_array = require('./product_data_.json')

//load the express session module
var session = require('express-session');

//create a new session when request is made to server, with encryption key 'MySecretKey'
app.use(session({ secret: "MySecretKey", resave: true, saveUninitialized: true }));

//parsing incoming request bodies, accessible through request.body
app.use(express.urlencoded({ extended: true }));

//parse json data
app.use(express.json())



//route for all methods and paths
app.all('*', function (request, response, next) {
    console.log(request.method + ' to path ' + request.path);
    //if a cart object has not been added to session data, add cart object
    //taken from lab 15
    if (typeof request.session.cart == 'undefined') {
        request.session.cart = {};
    }
    //call the next function
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



//route for add_to_cart, requested when 'add items to cart' button clicked on products display
app.post("/add_to_cart", function (request, response, next) {
    console.log(request.body)
    //grab the array of quantities desired, indexed in order of products on page
    var quantity_desired = request.body['quantity'];
    //grab the product type of the quantities submitted
    var product_key = request.body['product_type'];
    //initialize an errors object to store errors
    var errors = {};
    //validate quantities 
    for (i in products_array[product_key]) {
        let q = quantity_desired[i];
        //if quantity is nonNegInt, 
        if (isNonNegInt(q) == false) {
            //append an error key into errors object
            errors[`quantity_${i}`] = `${q} is not a valid quantity`;
        } else {
            //check if desired quantity is greater than quantity available
            if (q > products_array[product_key][i]['quantity_available']) {
                //add an error key with a value alerting that quantity exceeds inventory
                errors[`quantity_${i}`] = 'Quantity exceeds inventory!'
            }
        }
    }
    //if there are no errors, add item to cart
    if (Object.keys(errors).length == 0) {
        //if cart object not initialized in session data, initialize cart object
        if (typeof request.session.cart == 'undefined') {
            request.session.cart = {};
        }
        //if no quantities are selected for a product of a product type, input 0 as the value
        if (typeof request.session.cart[product_key] == 'undefined') {
            request.session.cart[product_key] = new Array(quantity_desired.length).fill(0);
        }
        //iterate through each item in product key
        for (i in request.session.cart[product_key]) {
            //add the quantity desired to the session data and pair with product key
            request.session.cart[product_key][i] += Number(quantity_desired[i]);
        }
    }
    //log the cart data to verify items have been added to cart object in session data
    console.log('cart data: ', request.session.cart);
    request.body.errors = JSON.stringify(errors);
    //create a URL with params for quantity data and errors object
    let params = new URLSearchParams(request.body);
    //redirect back to product display and with query string params
    //if errors object has errors, products page will alert user
    response.redirect(`./products_display.html?${params.toString()}`);
});



//route for post requests to try_login, route requested when login page submitted
app.post("/try_login", function (request, response, next) {
    //pull the username and password from the request body of login page
    user_username = request.body[`username`].toLowerCase(); //set the username to all lowercase letters, case insensitive username
    user_password = request.body[`password`]; //password remains case sensitive
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
            //insert the users username, email, and full name into the session data
            //others requests will check for existence of username object in session to validate successful login
            request.session['username'] = user_username;
            request.session['email'] = user_reg_info[user_username].email;
            request.session['full_name'] = user_reg_info[user_username].name;
            //log the session to make sure that the username and all other credentials are added to session
            console.log(request.session);
            //if the user logs in but does not have any items in cart, redirect to products display
            if (Object.keys(request.session.cart).length == 0) {
                response.redirect(`./products_display.html?product_type=Fruits`);
            //else if user logs in and has products in cart, redirect to the cart
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
        //after registration, add username, email, and full name to session data
        request.session['username'] = new_user_username;
        request.session['email'] = new_user_email;
        request.session['full_name'] = new_user_fullname;
        //log the session data to make sure registration info was added to session data
        console.log(`Session data after registering: ${request.session}`);
        //if there are no products in cart after registration, redirect to products page
        if (typeof request.session.cart[0] == 'undefined') {
            response.redirect(`./products_display.html?product_type=Fruits`);
        //if products exist in cart after registration, redirect to cart data
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



//route for GET requests for /session_data.js
app.get("/session_data.js", function (request, response, next) {
    response.type('.js');
    //if a cart object does not yet exist in session data, add cart object
    if (typeof request.session.cart == 'undefined') {
        request.session.cart = {};
    }
    //send session data including cart data, users username, fullname, and email
    var products_qty_str = `var cart_data = ${JSON.stringify(request.session.cart)}; var user = ${JSON.stringify(request.session.username)};  var full_name = ${JSON.stringify(request.session.full_name)}; var user_email = ${JSON.stringify(request.session.email)};`;
    //send the session data via js file
    response.send(products_qty_str);
});



//route to check for get requests to invoice.html file
app.get("/invoice.html", function (request, response, next) {
    //if the user has not successfully logged in but tries to access invoice
    if (typeof request.session.username == 'undefined') {
        //redirect back to the login page with query string to alert user to sign in first
        response.redirect('./login.html?please_sign_in');
    }
    next();
});


//route for get request to logout, requested when logout button clicked
app.get("/logout", function (request, response, next) {
    //destroy the session when the user logs out
    request.session.destroy();
    //redirect to the index.html page when user logs out
    response.redirect('./');
});


//request to clear session will be called when the final checkout page is loaded
app.get("/clear_session.js", function (request, response, next) {
    //destroy the session when the final checkout confirmation page loads
    request.session.destroy();
    next();
});



//this is for updating the cart, overwrite cart session
app.post("/update_cart", function (request, response, next) {
    //iterate through the cart data
    for (let pkey in request.session.cart) {
        for (let i in request.session.cart[pkey]) {
            //if the no quantites for an item selected
            if (request.session.cart[pkey][i] == 0) {
                continue;
            }
            //update with cart data with the new quantities
            request.session.cart[pkey][i] = Number(request.body[`cart_update_${pkey}_${i}`]);
        }
    }
    //redirect to the shopping cart after updating the products
    response.redirect('./shopping_cart.html');
});



//route for a post request to final checkout, requested when purchase button is clicked
app.post("/finalCheckout", function (request, response, next) {
    //if the uses username does not exist in session data (not logged in),
    if (typeof request.session.username == 'undefined') {
        //redirect back to the login page with query string to alert user to sign in first
        response.redirect('./login.html?please_sign_in');
    } else {
        //taken from Assignment 3 code examples page
        //if the user has not successfully logged in but tries to access invoice
        // Generate HTML invoice string
        var invoice_str = `Thank you for your order, ${request.session.full_name}! <br><br><table border><th>Quantity</th><th>Item</th>`;
        var shopping_cart = request.session.cart;
        //iterate through the products array and find what product keys match those in session
        for (product_key in products_array) {
            for (i = 0; i < products_array[product_key].length; i++) {
                if (typeof shopping_cart[product_key] == 'undefined') continue;
                qty = shopping_cart[product_key][i];
                if (qty > 0) {
                    //add a table row with product quantity and name of product
                    invoice_str += `<tr><td>${qty}</td><td>${products_array[product_key][i].name}</td><tr>`;
                }
            }
        }

        //updating the products_data JSON file with new inventory
        var updated_shopping_cart = request.session.cart;
        for (product_key in products_array) {
            for (i = 0; i < products_array[product_key].length; i++) {
                if (typeof updated_shopping_cart[product_key] == 'undefined') continue;
                //assign variable qty_to_remove to the quantity that is desired
                qty_to_remove = updated_shopping_cart[product_key][i];
                //subtract the qty_to_remove from the current available quantity
                products_array[product_key][i]['quantity_available'] -= qty_to_remove;
            }
        }
        //stringify the products_array object that has the new quantities
        new_product_data = JSON.stringify(products_array);
        //re-write the data the product_data_.json file
        fs.writeFileSync('./product_data_.json', new_product_data);

        //end the table element
        invoice_str += '</table>';
        // Set up mail server. Created a brandonitm352@gmail.com email for testing purposes
        var transporter = nodemailer.createTransport({
            //gmail service setup code from https://mailtrap.io/blog/nodemailer-gmail/
            service: 'gmail',
            auth: {
                user: 'brandonitm352@gmail.com',
                pass: 'brandonlovesitm352'
            }
        });
        //grab the users email from the session data
        var user_email = request.session.email;
        var mailOptions = {
            from: 'brandons_grocery@health.com',
            //send to the users email
            to: user_email,
            subject: "Order Confirmation - Brandon's Premium Grocery Store",
            //content will be html code from invoice_str
            html: invoice_str
        };

        transporter.sendMail(mailOptions, function (error, info) {
            if (error) {
                invoice_str += '<br>There was an error and your invoice could not be emailed :(';
            } else {
                invoice_str += `<br>Your invoice was mailed to ${user_email}`;
            }
            response.redirect(`./invoice.html`);
        });
    }
});

//when user clicks done button on final page, they will be redirected to the index page
app.post("/done", function (request, response, next) {
    response.redirect(`./`);
    next();
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