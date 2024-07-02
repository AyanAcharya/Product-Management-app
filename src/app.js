import express from "express"
import cors from "cors"
import cookieParser from "cookie-parser"
 


const app=express()
//set cross orign
app.use(cors({
    origin:process.env.CORS_ORIGIN,
    Credential:true
}))

//limit json data size 
app.use(express.json({limit:"16kb"}))


//url encoded setup-> whitespece "%20","+"
app.use(express.urlencoded({extended:true,limit:"16kb"}))

//store asset in node server 
app.use(express.static("public"))

app.use(cookieParser())



//routes import
import userRouter from './routes/user.routes.js';
import categoryRouter from './routes/category.routes.js';
import productRouter from './routes/product.routes.js';








//routes declaration
app.use("/api/v1/users",userRouter)
app.use("/api/v1/category",categoryRouter)
app.use("/api/v1/product",productRouter)

//http://localhost:8000/api/v1/users/register
export{app}