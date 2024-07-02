import mongoose from "mongoose";
import { DB_NAME } from "../constants.js";

const connectDB=async() =>{
    try {
       const connectionInstance = await mongoose.connect(`${process.env.MONGO_URL}/${DB_NAME}`)
       console.log(`mongodb connected...host${connectionInstance.connection.host}`);
        
    } catch (error) {
        console.error("mongodb connection error", error);
        Process.exit(1)
    }
}
export default connectDB