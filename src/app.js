import express from "express";
import cors from "cors";
import cookieParser from "cookie-parser";

const app = express();

const corsOptions = {
    origin: process.env.CORS_ORIGIN,
    credentials: true,
    methods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS'],
    allowedHeaders: ['Content-Type', 'Authorization']
}

app.use(
    cors(corsOptions)
)
app.options('*', cors(corsOptions))
app.use(express.json({limit:"16kb"}));
// allow data in url encoded format 
app.use(express.urlencoded({extended: true, limit:"16kb"}))
// serving assets like images , css
app.use(express.static("public"))
app.use(cookieParser())

import healthCheckRouter from "./routers/healthcheck.router.js";
import userRouter from "./routers/user.router.js";
import employeeRouter from "./routers/employee.router.js";

app.use("/api/v1/healthcheck", healthCheckRouter);
app.use("/api/v1/users", userRouter);
app.use("/api/v1/employees", employeeRouter);

export default app;