import express from "express";
import {
    createOrder,
    getAllOrders,
    getOrderById
} from "../Controllers/orders.controllers.js";
import {
    validateCreateOrder
} from "../Middlewares/order.middlewares.js";

const router = express.Router();

router.post("/create", validateCreateOrder, createOrder);
router.get("/list", getAllOrders);
router.get("/:id", getOrderById);

export default router;
