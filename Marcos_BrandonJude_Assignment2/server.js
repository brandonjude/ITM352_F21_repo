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

//parsing incoming request bodies, accessible through request.body
app.use(express.urlencoded({ extended: true }));


app.use(express.json())

//initialize the current user to none 
current_user = '';
current_user_email = '';

//route for all methods and paths
app.all('*', function (request, response, next) {
    console.log(request.method + ' to path ' + request.path + " query " + JSON.stringify(request.body[`quantity_textbox`]));
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
            //set the state of user logged in to true
            user_logged_in = true;
            current_user = JSON.stringify(user_reg_info[user_username].name);
            current_user_email = JSON.stringify(user_reg_info[user_username].email);
            //redirect to the invoice.html
            response.redirect(`./invoice.html`);
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
        
        //if registration is successful, user is considered to be logged in
        user_logged_in = true;

        current_user = JSON.stringify(user_reg_info[new_user_username].name);
        current_user_email = JSON.stringify(user_reg_info[new_user_username].email);
        //redirect to the invoice page with a paramter to alert a registration
        response.redirect('./invoice.html?user_registered');
    }

});


//route for get request for customer_info.js, requested by invoice page to personalize page for current user
app.get("/customer_info.js", function (request, response, next) {
    response.type('.js');
    //take the current username and corresponding email and save to variables that can be accessed by invoice page
    var customer_info = `var customer_name = ${current_user}; var customer_email = ${current_user_email}`;
    response.send(customer_info);
});




//route for a GET request of product_data.js 
app.get("/product_data.js", function (request, response, next) {
    response.type('.js');
    //send a stringified version of the products_array object
    var products_str = `var products_array = ${JSON.stringify(products_array)};`;
    response.send(products_str);
});



//route for GET requests for /product_data_quantity.js
app.get("/product_data_quantity.js", function (request, response, next) {
    response.type('.js');
    // quantity_arr = request.body[`quantity_textbox`];
    //allow access to the quantity_arr array object 
    var products_qty_str = `var quantity_arr = [${quantity_arr}];`;
    console.log(products_qty_str);
    //send the quantity_arr array object 
    response.send(products_qty_str);
});



//route for a POST request to /invoice, /invoice is action of order submit button
app.post('/pre_invoice', function (req, res, next) {
    //access the JSON data from the element quantity_textbox 
    quantity_arr = req.body[`quantity_textbox`];
    console.log(quantity_arr);

    //create global errors array 
    errors = [];
    //create global array that will store the index of each invalid quantity
    error_product_index = [];

    // returns false if q is not an whole integer or positive number
    function isNonNegInt(q) {

        if (q == "") q == 0;
        if (Number(q) != q) {
            //if q is not a number, push the error notification to the error array
            errors.push('not a number!'); // Check if string is a number value
            //pushing the index of q into the error_product_index array
            error_product_index.push(quantity_arr.indexOf(q));
            return false;
        }
        else if (q < 0) {
            //if q is not a positive value, push the error notification to the error array
            errors.push('a negative value!'); // Check if it is non-negative
            //pushing the index of q into the error_product_index array
            error_product_index.push(quantity_arr.indexOf(q));
            return false;
        }
        else if (parseInt(q) != q) {
            //if q is not a whole number, push the error notification to the error array
            errors.push('not an integer!'); // Check that it is an integer
            //pushing the index of q into the error_product_index array
            error_product_index.push(quantity_arr.indexOf(q));
            return false;
        }

        //if q is a valid, whole positive integer, return true
        return true;
    }

    //declare global for the sum of all products purchased
    sum_product_qty = 0;

    //declare global array to store the index of quantities that exceed the stores inventory 
    too_much_index = [];

    //iterate through the quantities received from the POST
    for (i in quantity_arr) {
        //check each value in the quantity in the array is valid
        //quantity validation 
        isNonNegInt(quantity_arr[i]);
        // add each quantity to the sum of quantities 
        sum_product_qty += parseInt(quantity_arr[i]);
        // if the quantity exceeds the quantity available, then push the index of the bad quantity
        // into the too_much_index array
        if (quantity_arr[i] > products_array[i].quantity_available) {
            too_much_index.push(quantity_arr.indexOf(quantity_arr[i]));
        }

    }

    console.log(`Total items purchased ${sum_product_qty}`);

    //if the user has not selected any products
    if (sum_product_qty == 0) {
        //redirect back to the order page and alert the user to add items to cart
        var message = "Please select items from store";
        res.redirect(`./products_display.html?alert_error=${message}`);
    }

    //else if there are errors
    else if (errors.length > 0) {
        var message = ''
        // for each error, alert the user of the quantity error and its associated product name
        for (i in errors) {
            message += `Your quantity for ${(products_array[error_product_index[i]].name)} is ${errors[i]} \n`;
        }
        // redirect to the order page with a query string that will instruct client browser to alert user
        res.redirect(`./products_display.html?alert_error=${message}`);
    }

    //else if there are quantities that exceed availability
    else if (too_much_index.length > 0) {
        var message = 'Quantities exceeded inventory!\n\n';
        for (i in too_much_index) {
            message += `Desired quantity for ${(products_array[too_much_index[i]].name)}: ${quantity_arr[too_much_index[i]]}\nStore inventory: ${products_array[too_much_index[i]].quantity_available}\n`;
        }
        message += `\n\nPlease adjust your quantity!`
        // redirect to the order page with a query string that will instruct client browser to alert user
        res.redirect(`./products_display.html?alert_error=${message}`);
    }

    else {

        //remove the purchased quantity from the inventory
        //update with the new quantity available for products 
        for (i in products_array) {
            products_array[i].quantity_available -= Number(quantity_arr[i]);
        }
        //if at least 1 product is selected and all quantites are valid, send to invoice.html
        res.redirect('./login.html')
    }
    console.log(errors);
    //console.log() the new quantity available for each product
    for (i in products_array) {
        console.log(`New quantity for ${products_array[i].name} is ${products_array[i].quantity_available}`)
    }

});




//route for GET requests to /errors_data.js
app.get("/errors_data.js", function (request, response, next) {
    response.type('.js');
    //will send a response with access to errors array and error_product_index array 
    var error_str = `var errors = ${JSON.stringify(errors)}; var error_product_index = ${JSON.stringify(error_product_index)};`;
    console.log(`Invalid quantities: ${error_str}`);
    response.send(error_str);
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

//default route into the ./public directory for any route that was not previously specified
app.use(express.static('./public'));

//listen for requests on port 8080
app.listen(8080, () => console.log(`Listening on port 8080`)); // note the use of an anonymous function here to do a callback