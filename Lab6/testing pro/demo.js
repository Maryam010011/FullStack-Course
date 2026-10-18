 /*console.log("Starting demo.js...");  

setTimeout(() => {
    console.log("This message is displayed after 2 seconds.");
}, 2000);

console.log("Ending demo.js..."); */

 //call back function  Synchronous 
 // The main function that accept function as argument 
 
//  function greet(name, welcome){  /* the first one is paramerter and second one is 
//     call back function name that did not have paranthesis because we are not calling 
//     it here we are just passing it as a reference to the main function 
//     and it's not an error to have different names */
//     console.log("Hello " + name);
//     welcome();  // calling the call back function
// } 
//  //call back function definition
// function welcomeMessage(){
//     console.log("Welcome to the demo!");
// }
//  //calling the main function and passing the call back function as an argument
// greet("Maryam Jahangir", welcomeMessage);   

// Call back fuction Asynchronous
// function checkseat(seatnumber, callback){
//     console.log("Cheaking seat" + seatnumber);

//     setTimeout(()=>{
//         console.log("Seat is availible");

//         callback("Seat" + seatnumber + "is availible!")
//     }, 2000);
// }

// checkseat("Maryam", (message)=>{console.log(message)});
// console.log("End of the program");

// Call Back Hell
// console.log("Booking started");

// setTimeout(()=>{
//     console.log("1. Seat verified");

//     setTimeout(()=>{
//      console.log("2. Payment Successfull")
     
//      setTimeout(()=>{
//         console.log("3. Ticket Generation");
//     setTimeout(() => {
//         console.log("a");

//     setTimeout(()=>{
//         console.log("b");

//     setTimeout(()=>{
//         console.log("c");
//     }, 2000);   
//     },2000)    
//     }, 2000);    
//      }, 2000);
//     }, 5000);
// }, 5000);
// console.log("Complete...");

// Promise
// const payment = new Promise((resolve, reject)=>{
//   let success = true;
// if(success){
//     resolve("Payment SuccessFull")
// }
// else {
//     reject(new Error("Payemnt failed!"));
// }

// });
// payment.then((message)=>{
//     console.log(message);
// });
// payment.catch((error)=>{
//      console.log(error);
// });

// 
function verifyseat(){
    return new Promise((resolve, reject)=>{
      console.log("check seat availibility..");

      setTimeout(()=>{
         resolve("Seat A1 is availible!")
      }, 2000);
       setTimeout(()=>{
         resolve("Seat A1 is Not Available!")
      }, 2000);
    });
}
verifyseat().then(()=>{
   console.log("Seat A1 is availible!");
})
.catch((error)=>{
    console.log(error.message);
})

// verifyseat(()=>{    // same thing with callback hell
//     processPayment(()=>{
//         issueTicket(()=>{
//             console.log("Ticket issued successfully!");
//         });
// });
// });
// verifyseat()    // same thing with Promise 
//   .then(() => processPaymentPromise())
//   .then(() => issueTicketPromise())
//   .catch((error) => {
//     console.error("Error:", error.message);
//   });


  async function bookTicket() {
      await verifyseat();
      await processPaymentPromise();
      await issueTicketPromise();
      console.log("Ticket booked successfully!");
    } 
  bookTicket();  