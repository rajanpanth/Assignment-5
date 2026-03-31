
// Arrow Function or anonymous Function
//the function without name
//syntax
const display = () =>{
    console.log("hello arrow function")
}
//function call
display();

//inline or single line arrow function
let add = (a,b) => a+b; 
let result = add(5, 8);
console.log(`addition is: ${result}`)

//multiline arrow function
let divide = (a,b) => {
 if(b==0){
    return "infinity"
 }
    return a/b;
}
let dresult = divide(10, 2);
console.log(`division is: ${dresult}`)
let dresult2 = divide(10, 0);
console.log(`division is: ${dresult2}`) 
