var express = require('express');
var app = express();



app.all('*', function (request, response, next) {
    console.log(request.method + ' to path ' + request.path + " query " + JSON.stringify(request.query));
    next();
});
app.get('/test', function (req, res){
    res.send('Hello my name is Brandon');
});
app.listen(8080, () => console.log(`listening on port 8080`)); // note the use of an anonymous function here to do a callback