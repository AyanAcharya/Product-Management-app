//using module js
import dotenv from "dotenv"
import connectDB from "./db/index.db.js";
import {app} from "./app.js";


dotenv.config({
    path:'./env'
});



connectDB()
//dfdfdf
.then(()=>{

    app.on("error", (error)=>{
        console.error("ERROR",error);
        throw error
    })

    app.listen(process.env.PORT || 8000,()=>{
        console.log(`server is running at port :${process.env.PORT}`);
    })
})

.catch((err)=>{
    console.log("mongo DB connection failed",err);
})