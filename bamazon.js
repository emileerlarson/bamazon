var mysql = require('mysql');
var inquirer = require('inquirer');

var connection = mysql.createConnection({
    host: "localhost",
    port: 3306,
    user: "root",
    password: "B1gfatfun",
    database: "bamazon_db"
  });
 
connection.connect();
 
connection.query('SELECT * from products', function (error, results, fields) {
  if (error) throw error;
  whatToBuy();
});
  function whatToBuy(){
      connection.query("select ITEM_ID, PRODUCT_NAME, PRICE from products", function(err, res){

        var product = [];
        var id = [];
        for (var i = 0; i < res.length; i++){
          id.push(res[i].ITEM_ID);
          product.push("ID: " +res[i].ITEM_ID+" Product Name: " +res[i].PRODUCT_NAME+" Price: " +res[i].PRICE);
          console.log("ID: " +res[i].ITEM_ID+" Product Name: " +res[i].PRODUCT_NAME+" Price: " +res[i].PRICE);
        }
          inquirer.prompt([
            {name:"product",
              type:"input",
              message: "What Product ID would you like to Purchase?"
            },
            {
                name: "amount",
                type: "input",
                message: "How many would you like to Purchase?"
            }
          ])
          .then(function(answer) {
           var amount = answer.amount;
           var id = answer.product;
           var query = "select STOCK_QUANTITY from products where ?";
           connection.query(query, [{ ITEM_ID: id }], function(err, res) {
             var stock = res[0].STOCK_QUANTITY;
              if(amount > stock){
                console.log("Sorry we currently do not have that much in stock")
                stillShop();
              }else{
                var query = "select PRICE from products where ?";
                connection.query(query, [{ ITEM_ID: id }], function(err, res) {
                  var dollar = res[0].PRICE;
                  var cost = amount * dollar;
                  console.log("\nThe total of your purchase comes to: $" +cost)
                });
                var remain = stock - amount;
                connection.query(
                  "UPDATE products SET ? WHERE ?",
                  [
                    {
                      STOCK_QUANtITY: remain
                    },
                    {
                      ITEM_ID: id
                    }
                  ],
                  function(error) {
                    if (error) throw err;
                    
                  }
                )
              }
              stillShop()
            });
          });
      });
    }; 
    
function stillShop(){
  inquirer.prompt({
      name:"stillshop",
      type:"confirm",
      message: "Would you like to contiue shopping?"  
  })
  .then(function(answer) {
    console.log(answer)
    if(answer){
      whatToBuy();
    }else{
     console.log("Thanks Come again!")
     connection.end();
    }
  });
}