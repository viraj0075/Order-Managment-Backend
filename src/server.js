import "dotenv/config";
import express from "express"
import cors from "cors"
import ApiError from "./Utils/ApiError.js"
import { connectDB, disconnectDB } from "./Config/db.js"
import productRoutes from "./Routes/products.routes.js"
import orderRoutes from "./Routes/orders.routes.js"
import { startOrderStatusCron } from "./Utils/orderCron.js";


const app = express();
if (!process.env.PORT) throw new ApiError(400, "PORT is not defined")
const port = process.env.PORT;

app.use(express.json());

const corsOrigin = process.env.CORS_ORIGIN
    ? (process.env.CORS_ORIGIN.includes(",")
        ? process.env.CORS_ORIGIN.split(",").map(o => o.trim().replace(/\/$/, ""))
        : process.env.CORS_ORIGIN.trim().replace(/\/$/, ""))
    : undefined;

app.use(cors({
    origin: corsOrigin,
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

