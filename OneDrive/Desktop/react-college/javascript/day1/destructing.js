let student = ["hari", "shyam", "ram", "karan"];
//destructing array
let[a,b,c,d,e]=student;
console.log(a,b,c,d,e);

//destructing object
let obj = {
    name: "hari",
    age: 20,
    address: "nepal",
    city: "kathmandu",
    state: "bagmati"
}
let{name, age, city, address} = obj
console.log(name, age, city, address)