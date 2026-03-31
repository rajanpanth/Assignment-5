// default parameters example
const multiply = (a=1,b=1) => a*b;

//function call
let result1 = multiply(5, 4);
console.log(`multiplication with both parameters: ${result1}`)
let result2 = multiply(5);
console.log(`multiplication with one parameter: ${result2}`)
let result3 = multiply();
console.log(`multiplication with no parameters: ${result3}`)