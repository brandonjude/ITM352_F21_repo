const fs = require('fs');

var filename = './user_data.json';

var user_data_string = fs.readFileSync(filename, 'utf-8');
var user_data_obj = JSON.parse(user_data_string);

console.log(user_data_obj['kazman']['password']);


console.log(user_data_string, typeof user_data_string);