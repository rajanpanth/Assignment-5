// spread operator
//natation : ...
let arr1 = [35, 34, 66,77,88]
let arr2 = [12, 13, 14, 15]
let temp = [...arr1, ...arr2];
console.log(temp)
//spread operator in object
let obj1 = {
    fullName: "hari sharma",
    age: 29

}
let obj2={

    address: "kathmandu",
    city: "nepal",
    ...obj1
}
let obj3 = {
    phone: 9845678901,
    contact: 1223466,
}
let obj4 = {
    ...obj2,
    ...obj3
}
console.log(obj2)
console.log(obj4)
