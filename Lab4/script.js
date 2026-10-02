document.title= "Student Result Dashboard";
//comments
/*Multi line comments */
//variables
/*console.log(name);
console.log("marks");
let name = "John Doe";
var marks = 85;*/
const student ={
    id: 1,
    name: "Maryam Jahangir",
    subject: "OS",
    marks: 85
}
const arry = [{
    id: 1,
    name: "Maryam Jahangir",
    subject: "OS",
    marks: 85
},
{
    id: 2,
    name: "Maryam Yaqoob",
    subject: "OOP",
    marks: 95
}]

/*csole.log(student);
console.log(arry[0].name);

// for---in  loop in a single objects
/*for( const key in student){
    console.log(key, student[key]);
}   */

    /*or---of loop in an array of objects 
for(const i of arry){ 
    for(const key in i){
        console.log(key, i[key]);
    }
}*/
//filter method
/*
const passing = arry.filter(i => i.marks >= 40);
console.log(passing);

//reduce  perform calculation on array of objects and return single value
const total =arry.reduce((sum, i) => sum + i.marks, 0);
console.log(total);

// sort method
const sorted = arry.sort((a, b) => a.marks - b.marks);
console.log(sorted);
 // find method

 const find = arry.find(i => i.name === "Maryam Jahangir");
 console.log(find);

 */
class Student{
    constructor(id, name, marks){
        this.id= id;
        this.name= name;
        this.marks= marks;
    }
    getstatus(){
        return this.marks >= 40 ? "Pass" : "Fail";
    }
}
const std=new Student(1, "Ayesha", 85);
std.getstatus();
const {id, name, marks} = std;
console.log("My ID is "+id+" My Name is "+name+" My Marks are "+marks);