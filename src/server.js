import "dotenv/config";
import express from "express"
import cors from "cors"
import ApiError from "./utils/ApiError.js"
import { connectDB, disconnectDB } from "./Config/db.js"
import productRoutes from "./Routes/products.routes.js"
import orderRoutes from "./Routes/orders.routes.js"
import { startOrderStatusCron } from "./Utils/orderCron.js";


const app = express();
if (!process.env.PORT) throw new ApiError(400, "PORT is not defined")
const port = process.env.PORT;

app.use(express.json());
app.use(cors({
    origin: process.env.CORS_ORIGIN,
    credentials: true
}));

connectDB();
startOrderStatusCron();

app.use("/products", productRoutes);
app.use("/orders", orderRoutes);

app.use((err, req, res, next) => {
    const statusCode = err.statusCode || 500;
    const message = err.message || "Internal Server Error";
    return res.status(statusCode).json({
        success: false,
        statusCode,
        message,
        errors: err.errors || []
    });
});

app.listen(port, () => {
    console.log(`Server is running on port ${port}`);
});



process.on("unhandledRejection", (error) => {
    console.log(`Unhandled Rejection: ${error.message}`);
    disconnectDB();
    process.exit(1);
});

process.on("uncaughtException", (error) => {
    console.log(`Uncaught Exception: ${error.message}`);
    disconnectDB();
    process.exit(1);
});

