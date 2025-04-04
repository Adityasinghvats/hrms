import mongoose from "mongoose";
import {DB_NAME} from "../constants.js"

const connectdb = async() => {
    try {
        const conn =  await mongoose.connect(`${process.env.MONGO_URI}/${DB_NAME}`)
        console.log("DB connected")
        console.log("DB connection details", `${conn.connection.host}`)
    } catch (error) {
        console.log("MongoDB connection error", error);
        process.exit(1);
    }
}
export default connectdb;