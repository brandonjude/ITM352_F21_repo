//Express server 
//Brandon Jude Marcos

//load the express module 
var express = require('express');
//assign the express method to the app variable
var app = express();

//pulling data from product_data_.json and assigning to products_array
var products_array = require('./product_data_.json')

//parsing incoming request bodies, accessible through request.body
app.use(express.urlencoded({ extended: true }));

//route for all methods and paths
app.all('*', function (request, response, next) {
    console.log(request.method + ' to path ' + request.path + " query " + JSON.stringify(request.body[`quantity_textbox`]));
    next();
});

//route for a GET request of product_data.js 
app.get("/product_data.js", function (request, response, next) {
    response.type('.js');
    //send a stringified version of the products_array object
    var products_str = `var products_array = ${JSON.stringify(products_array)};`;
    response.send(products_str);
 });



//route for a POST request to /invoice, /invoice is action of order submit button
app.post('/invoice', function (req, res, next){
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
    if (sum_product_qty == 0){
        //redirect back to the order page and alert the user to add items to cart
        var message = "Please select items from store";
        res.redirect(`./products_display.html?alert_error=${message}`);
    }

    //else if there are errors
    else if (errors.length > 0){
        var message = ''
        // for each error, alert the user of the quantity error and its associated product name
        for (i in errors){
            message += `Your quantity for ${(products_array[error_product_index[i]].name)} is ${errors[i]} \n`;
        }
        // redirect to the order page with a query string that will instruct client browser to alert user
        res.redirect(`./products_display.html?alert_error=${message}`); 
    }

    //else if there are quantities that exceed availability
    else if (too_much_index.length > 0){
        var message = 'Quantities exceeded inventory!\n\n';
        for (i in too_much_index){
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
        res.sendFile(__dirname + '/public/invoice.html');
    }
  
    console.log(errors);
    
    //console.log() the new quantity available for each product
    for (i in products_array){
        console.log(`New quantity for ${products_array[i].name} is ${products_array[i].quantity_available}`)
    }

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

 //route for GET requests to /errors_data.js
 app.get("/errors_data.js", function (request, response, next) {
    response.type('.js');
    //will send a response with access to errors array and error_product_index array 
    var error_str = `var errors = ${JSON.stringify(errors)}; var error_product_index = ${JSON.stringify(error_product_index)};`;
    console.log(`Invalid quantities: ${error_str}`);
    response.send(error_str);
 });

//default route into the ./public directory for any route that was not previously specified
app.use(express.static('./public'));
//listen for requests on port 8080
app.listen(8080, () => console.log(`Listening on port 8080`)); // note the use of an anonymous function here to do a callback