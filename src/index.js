import connectdb from "./config/db.js";
import app from "./app.js";

const PORT = process.env.PORT || 8080;

connectdb().then(()=>{
    app.listen(PORT, () => {
        console.log("Server is running on port ", PORT);
    });
})