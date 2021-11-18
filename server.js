var express = require('express');
var app = express();

var products_array = require('./product_data_.json')

app.use(express.urlencoded({ extended: true }));

app.all('*', function (request, response, next) {
    console.log(request.method + ' to path ' + request.path + " query " + JSON.stringify(request.body[`quantity_textbox`]));
    next();
});


app.get("/product_data.js", function (request, response, next) {
    response.type('.js');
    var products_str = `var products_array = ${JSON.stringify(products_array)};`;
    response.send(products_str);
 });




app.post('/invoice', function (req, res, next){
    // receipt = ''; 
    
    quantity_arr = req.body[`quantity_textbox`]; 
    console.log(quantity_arr);

    errors = [];
    error_product_index = [];

    function isNonNegInt(q) {

        if (q == "") q == 0;
        if (Number(q) != q) {
            errors.push('not a number!'); // Check if string is a number value
            error_product_index.push(quantity_arr.indexOf(q));
            return false;
        }
        else if (q < 0) {
            errors.push('a negative value!'); // Check if it is non-negative
            error_product_index.push(quantity_arr.indexOf(q));
            return false;
        }
        else if (parseInt(q) != q) {
            errors.push('not an integer!'); // Check that it is an integer
            error_product_index.push(quantity_arr.indexOf(q));
            return false;
        }

        return true;
    }


   
    sum_product_qty = 0;

    too_much_index = [];

    for (i in quantity_arr) {  
 
       isNonNegInt(quantity_arr[i]);
       sum_product_qty += parseInt(quantity_arr[i]);
       if (quantity_arr[i] > products_array[i].quantity_available) {
            too_much_index.push(quantity_arr.indexOf(quantity_arr[i]));
       }

       console.log(`Too much index: `, too_much_index);
       
    }

    console.log(`Total items purchased ${sum_product_qty}`);

    if (sum_product_qty == 0){
        var message = "Please select items from store";
        res.redirect(`./products_display.html?alert_error=${message}`);
    }

    else if (errors.length > 0){
        var message = ''
        for (i in errors){
            message += `Your quantity for ${(products_array[error_product_index[i]].name)} is ${errors[i]} \n`;
        }
        res.redirect(`./products_display.html?alert_error=${message}`); 
    }

    else if (too_much_index.length > 0){
        var message = 'Quantities exceeded inventory!\n\n';
        for (i in too_much_index){
            message += `Desired quantity for ${(products_array[too_much_index[i]].name)}: ${quantity_arr[too_much_index[i]]}\nStore inventory: ${products_array[too_much_index[i]].quantity_available}\n`;
        }
        message += `\n\nPlease adjust your quantity!`
        res.redirect(`./products_display.html?alert_error=${message}`);
    }

    else {
        res.sendFile(__dirname + '/public/invoice.html');
    }
  
    console.log(errors);
    console.log(error_product_index);

});

app.get("/product_data_quantity.js", function (request, response, next) {
    response.type('.js');
    // quantity_arr = request.body[`quantity_textbox`];
    var products_qty_str = `var quantity_arr = [${quantity_arr}];`;
    console.log(products_qty_str);
    response.send(products_qty_str);
 });

 app.get("/errors_data.js", function (request, response, next) {
    response.type('.js');
    var error_str = `var errors = ${JSON.stringify(errors)}; var error_product_index = ${JSON.stringify(error_product_index)};`;
    console.log(error_str);
    response.send(error_str);
 });


app.use(express.static('./public'));
app.listen(8080, () => console.log(`listening on port 8080`)); // note the use of an anonymous function here to do a callback