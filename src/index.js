import connectdb from "./config/db.js";
import app from "./app.js";
import dotenv from 'dotenv';

dotenv.config({
    path:'./.env'
})

const PORT = process.env.PORT || 8080;

connectdb().then(()=>{
    app.listen(PORT, () => {
        console.log("Server is running on port ", PORT);
    });
}).catch( (err) => {
    console.log("Mongodb connection error", err);
})