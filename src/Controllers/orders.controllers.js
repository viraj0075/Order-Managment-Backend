import ApiError from "../Utils/ApiError.js";
import ApiResponse from "../Utils/ApiResponse.js";
import { prisma } from "../Config/db.js";

export const createOrder = async (req, res) => {
    try {
        const { orderItems, deliveryDetails, totalAmount } = req.body;

        const order = await prisma.order.create({
            data: {
                orderItems,
                deliveryDetails,
                totalAmount
            }
        });

        return res.status(201).json(new ApiResponse(201, order, "Order created successfully"));
    } catch (error) {
        if (error instanceof ApiError) throw error;
        throw new ApiError(500, error.message);
    }
}

export const getAllOrders = async (req, res) => {
    try {
        const orders = await prisma.order.findMany({
            where: {
                status: {
                    in: ["Delivered", "Cancelled"]
                }
            },
            orderBy: {
                createdAt: "desc"
            }
        });
        return res.status(200).json(new ApiResponse(200, orders, "Orders fetched successfully"));
    } catch (error) {
        throw new ApiError(500, error.message);
    }
}

export const getOrderById = async (req, res) => {
    try {
        const { id } = req.params;
        const order = await prisma.order.findUnique({
            where: {
                orderId: id
            }
        });

        if (!order) {
            throw new ApiError(404, "Order not found");
        }

        return res.status(200).json(new ApiResponse(200, order, "Order fetched successfully"));
    } catch (error) {
        if (error instanceof ApiError) throw error;
        throw new ApiError(500, error.message);
    }
}