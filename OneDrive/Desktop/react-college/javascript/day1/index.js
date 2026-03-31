
// console.log("hello world")
// var : functional scope variable
// let : block scope variable
// const : block Scope
// let, var and const ia a dynamic typed variable
// dynamically typed variable means: the variqable made with let const and vat doeswnot have uits type, so its type is definded by what type of data is given to the variable

function myfunction() {
var a = 20;
console.log("a= ", a) 
//block
 if(true){
var b = 40;
console.log("b= ", b)
 }
 console.log("outside if block: ", b)
}

//function call
// myfunction()
// console.log("outside functional block: ", a)

for(let i =0; i<3; i++){
    console.log("i: ",i)
    const pi = 3.14

}

// console.log("value of pi is: ", pi)
