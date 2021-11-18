const fs = require('fs');

var filename = './user_data.json';

// will return boolean of the existence of the file 
if (fs.existsSync(filename)) {
    var user_data_string = fs.readFileSync(filename, 'utf-8');
var user_data_obj = JSON.parse(user_data_string);
var file_stats = fs.statSync(filename);

//console.log(user_data_obj['kazman']['password']);
console.log(`${filename} has ${file_stats.size} characters `);
} else {
    console.log(`${filename} does not exist`);
}




console.log(user_data_string, typeof user_data_string);