import app from './app.js';

import { config } from "dotenv";
import connectDatabase from "./config/database.js";

//Handling Uncaugth Exception
process.on("uncaughtException",(err)=>{
    console.log(`Error :${err.message}`);
    console.log(`Shutting down the Server due to Uncaugth Exception`);
    process.exit(1);
})



// config 
config({path:"backend/config/config.env"});

//Connecting to database
connectDatabase();


const server = app.listen(process.env.PORT,()=>{
    console.log(`Server is working on http://localhost:${process.env.PORT}`);
})


//Unhandled Promise Rejection
process.on("unhandledRejection",err=>{
    console.log(`Error: ${err.message}`);
    console.log(`Shutting down the Server due to Unhandled Promise Rejection`)
    console.log(err)

    server.close(()=>{
        process.exit(1);
    });
}) ;