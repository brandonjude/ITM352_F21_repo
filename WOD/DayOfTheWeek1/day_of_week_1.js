var day = 20;
var month = 'July';
var year = 2001;

if (month == 'January' || 'February'){
    year_2 = year - 1;
    year_2  = parseInt(year/4) + year;
}
else{
    year_2  = parseInt(year/4) + year;
}

array_of_days = ["Sunday","Monday","Tuesday","Wednesday","Thursday","Friday", "Saturday"];

year_3 = year_2 - parseInt(year/100);

year_4 = parseInt(year/400) + year_3;

year_5 = year_4 + day;

var month_key = {
    "January":0,
    "Febuary":3,
    "March": 2,
    "April": 5,
    "May": 0,
    "June": 3,
    "July": 5,
    "August": 1,
    "September":4,
    "October":6,
    "November":2,
    "December":4
};

year_6 = year_5 + month_key[month];

year_7 = year_6%7;

day_of_the_week = array_of_days[year_7];

console.log(month + " " + day + ", " + year + " was on a " + day_of_the_week);