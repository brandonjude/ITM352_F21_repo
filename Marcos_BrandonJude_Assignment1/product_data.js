var products_array = [

    {  
        "name":"Watermelon",  
        "price": 34.00,  
        "image": "./images/watermelon.png",
        "quantity_available": 5
    }, 
    {  
        "name":"Mangosteen",  
        "price": 27.00,  
        "image": "./images/mangosteen.png",
        "quantity_available": 3
    }, 
    {  
        "name":"Lemon",  
        "price": 19.00,  
        "image": "./images/lemon.png",
        "quantity_available": 9
    }, 
    {  
        "name":"Dragon Fruit",  
        "price": 71.00,  
        "image": "./images/dragonfruit.png",
        "quantity_available": 3
    }, 
    {  
        "name":"Cherry",  
        "price": 5.00,  
        "image": "./images/cherry.png",
        "quantity_available": 8
    }

];

var product_quantities = [3,7,-1,0,6]

for (i in products_array){
    products_array[i]["quantity_purchased"] = product_quantities[i];
}