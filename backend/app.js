import express, { json } from "express";
import cookieParser from "cookie-parser";

import errorMiddleware from "./middleware/error.js";

const app=express();
app.use(json())
app.use(cookieParser())

// Route imports
import productRoutes from "./routes/productRoute.js";
import userRoutes from "./routes/userRoute.js";
import orderRoutes from "./routes/orderRoute.js";

app.use("/api/v1",productRoutes);
app.use("/api/v1", userRoutes);
app.use("/api/v1", orderRoutes);

//Middleware for Errors
app.use(errorMiddleware);



export default app  