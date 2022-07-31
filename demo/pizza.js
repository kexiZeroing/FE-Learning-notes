// Refer to https://github.com/MatWilmot/pizza-order-builder

// First, bring inquirer into the project
const inquirer = require("inquirer");

// initialize some variables
let order;
let Pizza;

// Let's decide what sizes of pizza we offer
const sizesArray = ["10 inch", "12 inch", "14 inch", "16 inch"];

// Let's decide what crust types we offer
const crustArray = ["Thin Crust", "Regular", "Pan", "Stuffed Crust"];

// Let's decide what sauces we offer
const saucesArray = ["Marinara", "BBQ", "Alfredo Sauce"];

// Let's decide what toppings we offer
const toppingsArray = [
  "Cheese",
  "Extra Cheese",
  "Ham",
  "Beef",
  "Pepperoni",
  "Chicken",
  "Bacon",
  "Jalapeños",
  "Onions",
  "Banana Peppers",
  "Olives",
  "Mushrooms",
  "Pineapple",
  "Green Peppers",
];

// This function allows us to clear out the order variable
const clearOrder = () => {
  // The order will be an array containing Pizza objects
  order = [];

  // if we're clearing the order, we won't need the current pizza, either
  clearPizza();
};

// This function allows us to reset the Pizza object for re-use in an order
const clearPizza = () => {
  // here we define an empty Pizza object
  Pizza = {
    name: "",
    size: "",
    crust: "",
    sauce: "",
    toppings: [],
  };
};

// startApp() will be how we begin the application
const startApp = () => {
  inquirer
    .prompt([
      {
        name: "start",
        type: "list",
        message: "What would you like to do?",
        choices: ["New Order", "Exit"],
      },
    ])
    .then((res) => {
      if (res.start === "Exit") {
        return;
      } else {
        clearOrder();
        getName();
      }
    });
};

// this function gets the user's name and adds it to the Pizza object
const getName = () => {
  inquirer
    .prompt([
      {
        name: "customer_name",
        message: "Customer name:",
      },
    ])
    .then((res) => {
      Pizza.name = res.customer_name;
      getSize();
    });
};

// this function gets the size of the pizza and adds it to the Pizza object
const getSize = () => {
  inquirer
    .prompt([
      {
        name: "pizza_size",
        type: "list",
        message: "Pizza size:",
        choices: sizesArray,
      },
    ])
    .then((res) => {
      Pizza.size = res.pizza_size;
      getCrust();
    });
};

// this function gets the desired crust type and adds it to the Pizza object
const getCrust = () => {
  inquirer
    .prompt([
      {
        name: "pizza_crust",
        type: "list",
        message: "Crust type:",
        choices: crustArray,
      },
    ])
    .then((res) => {
      Pizza.crust = res.pizza_crust;
      getSauce();
    });
};

// this function gets the desired sauce type and adds it to the Pizza object
const getSauce = () => {
  inquirer
    .prompt([
      {
        name: "pizza_sauce",
        type: "list",
        message: "Sauce type:",
        choices: saucesArray,
      },
    ])
    .then((res) => {
      Pizza.sauce = res.pizza_sauce;
      getToppings();
    });
};

// This function creates an array of toppings the user wants and pushes them to the Pizza object
const getToppings = () => {
  inquirer
    .prompt([
      {
        name: "pizza_toppings",
        type: "checkbox",
        message: "Choose toppings:",
        choices: toppingsArray,
      },
    ])
    .then((res) => {
      res.pizza_toppings.forEach((topping) => {
        Pizza.toppings.push(topping);
      });
      order.push(Pizza);
      anotherPizza();
    });
};

// this function asks if the user wants another pizza in their order
// if they do, clear the pizza object and start building a new one by getting the customer's name
// if they don't, print the order to the console and go back to the main menu
const anotherPizza = () => {
  inquirer
    .prompt([
      {
        name: "another_pizza",
        type: "confirm",
        message: "Add another pizza?",
      },
    ])
    .then((res) => {
      if (res.another_pizza) {
        clearPizza();
        getName();
      } else {
        console.log("Your order:", order);
        startApp();
      }
    });
};

// since everything is broken down in to functions, we need to actually start the application
startApp();
