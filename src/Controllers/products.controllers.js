import ApiError from "../Utils/ApiError.js";
import ApiResponse from "../Utils/ApiResponse.js";
import { prisma } from "../Config/db.js";

export const getProductsByCategory = async (req, res) => {
    try {
        const { category } = req.params;
        const products = await prisma.product.findMany({
            where: {
                category: {
                    equals: category,
                    mode: "insensitive"
                }
            }
        });
        return res.status(200).json(new ApiResponse(200, products, `Products in category ${category} fetched successfully`));
    } catch (error) {
        throw new ApiError(500, error.message);
    }
}