var express = require('express');
var app = express();

var products_array = require('./product_data_.json')

app.use(express.urlencoded({ extended: true }));

app.all('*', function (request, response, next) {
    console.log(request.method + ' to path ' + request.path + " query " + JSON.stringify(request.body[`quantity_textbox`]));
    next();
});
//app.get('/products_display.html', function (req, res){
    //res.send('Hello my name is Brandon');
//});

app.get("/product_data.js", function (request, response, next) {
    response.type('.js');
    var products_str = `var products_array = ${JSON.stringify(products_array)};`;
    response.send(products_str);
 });





app.post('/invoice', function (req, res, next){
    // receipt = ''; 
    
    quantity_arr = req.body[`quantity_textbox`]; 

   /* function isNonNegInt(q) {

        errors = []; // assume no errors at first
        if (q == "") q == 0;
        if (Number(q) != q) {
            errors.push("Not a number!"); // Check if string is a number value
            return true;
        }
        else {
            if (q < 0) {
                errors.push("Negative value!"); // Check if it is non-negative
                return true;
            }
            if (parseInt(q) != q) {
                errors.push("Not an integer!"); // Check that it is an integer
                return true;
            }

        }
    }

    var warning = ``;
    for (i in quantity_arr) {  
    
       if (isNonNegInt(quantity_arr[i]) == true) {
            console.log(quantity_arr[i], errors);
            warning += `Your quantity: ${quantity_arr[i]} is ${errors}`;
       }
       else {
        console.log(quantity_arr[i]);
       }
    } */
  
    res.sendFile(__dirname + '/public/invoice.html');

});

app.get("/product_data_quantity.js", function (request, response, next) {
    response.type('.js');
    // quantity_arr = request.body[`quantity_textbox`];
    console.log(quantity_arr);
    var products_qty_str = `var quantity_arr = [${quantity_arr}];`;
    console.log(products_qty_str);
    response.send(products_qty_str);
 });


app.use(express.static('./public'));
app.listen(8080, () => console.log(`listening on port 8080`)); // note the use of an anonymous function here to do a callback