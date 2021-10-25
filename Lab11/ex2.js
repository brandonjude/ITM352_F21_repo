
// create attributes varible containing strings, ints, floats
var attributes  =  "Brandon;20;20.5;-19.5";
// split the attributes string by the ; and store them in 'parts'
var parts = attributes.split(";");

// for each attribute within 'parts'
for (part of parts){
    //print the type of part
    console.log(part, typeof part);
}

// concatnetnate parts and seperate by comma
console.log(parts.join(","));
