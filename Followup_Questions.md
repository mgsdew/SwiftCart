

# 1) What is the difference between null and undefined?

'null' value define by a varriable where 'undefined' isn't defined by any varriable, For example:

let a = null;      // set an empty value
let b;             // undefined


# 2) What is the use of the map() function in JavaScript? How is it different from forEach()?

'map()' creates and returns a new array based on the transformation where 'forEach()' just a loops and does not return anything.

# 3) What is the difference between == and ===?

'==' compares values after type conversion, where '===' compares both value and type. For example:  

"5" == 5   // true
"5" === 5  // false

# 4) What is the significance of async/await in fetching API data?

'async/await' uses for asynchronous programming during data fetching which makes API calls look like simple synchronous code. Also it avoids callback loop and improves readability.  

# 5) Explain the concept of Scope in JavaScript (Global, Function, Block).

Global scope can be accessible everywhere where Function scope can be accessible only inside a function. For example:

var x = 10;   // global because it's outside a function

if (true) {
  var y = 20; 
}

console.log(y); // 20 so, y is a Function scope which accessible outside the if-block

 
On the other hands, Block scope only accessible inside '{}' (e.g., let, const). For example:

if (true) {
  let x = 10;   // block‑scoped
}

console.log(x); // Error as x is not defined