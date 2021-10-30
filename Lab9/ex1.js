var month = 7;
var day = 20;
var year = 2001;
step1 = 01;
step2 = parseInt(step1 / 4);
step3 = step2 + step1
step4 = 6;
step6 = step4 + step3;
step7 = day + step6;
step8 = step7;
step9 = step8 -1; // not a leap year
step10 = step9 % 7;
console.log(step10)