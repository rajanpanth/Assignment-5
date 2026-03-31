//tempalte literals sand string interpolation
// it defines how to embed the value of variable in the string
// syntax

let myname = "rajan"
let myage = 20;
//traditional way
let myembledstring = "My name is " + myname + " and my age is " + myage;
console.log("traditional way: ", myembledstring)

//using template literals
let myoriginalembledstring = `My name is ${myname} and my age is ${myage}`;
console.log(`using template literals: ${myoriginalembledstring}`)
