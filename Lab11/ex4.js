

function isNonNegInt(q, returnErrors = false) {
    // checks if a string is a non-neg integer. Returns true if q is a non-neg int
    // If returnErros == true, the array errors is returned. Else returns true if q is nonNegInt
    errors = []; // assume no errors at first
    if (q == "") q ==0;
    if (Number(q) != q) errors.push('Not a number!'); // Check if string is a number value
    if (q < 0) errors.push('Negative value!'); // Check if it is non-negative
    if (parseInt(q) != q) errors.push('Not an integer!'); // Check that it is an integer

    return (returnErrors ? errors : (errors.length == 0));

}


var attributes  =  "Dan;3;-4;6.25";
var parts = attributes.split(";");

parts.forEach((item, index) => {console.log(`part ${index} is ${(isNonNegInt(item)?'a':'not a')} quantity`);} );

/* for (part of parts){

    console.log(`${part} isNonNegInt: ${isNonNegInt(part, false)}`);
} */



/* console.log(isNonNegInt(1, false));
console.log(isNonNegInt(-1, true));
console.log(isNonNegInt(1.21, false));
console.log(isNonNegInt("Hello", true));
console.log(isNonNegInt("12", false)); */


function checkIt(item, index){
    console.log(`part ${index} is ${(isNonNegInt(item)?'a':'not a')} quantity`);
}


