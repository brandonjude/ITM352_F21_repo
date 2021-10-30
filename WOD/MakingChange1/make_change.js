
function make_change(amount){

    console.log("To make change for " + amount + ", you will need:")
    console.log("Quarters: " + parseInt(amount/.25));
    amount = amount%.25;
    console.log("Dimes: " + parseInt(amount/.10));
    amount = amount%.10;
    console.log("Nickels: " + parseInt(amount/.05));
    amount = amount%.05;
    console.log("Pennies: " + parseInt(amount/.01));
    


}

make_change(.63)