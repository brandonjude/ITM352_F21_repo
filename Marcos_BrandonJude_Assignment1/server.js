

var express = require('express');
var app = express();
var path = require('path');

var products_array = require('./products.json');

// Routing 

// monitor all requests
app.all('*', function (request, response, next) {
   console.log(request.method + ' to ' + request.path);
   next();
});

// process purchase request (validate quantities, check quantity available)
// PUT YOUR CODE HERE!!!!!! 

// route all other GET requests to files in public 
app.use(express.static('./public'));

app.get('/', function(req, res) {
    res.sendFile(path.join(__dirname, '/public/store_page.html'));
  });


// start server
app.listen(8080, () => console.log(`listening on port 8080`));