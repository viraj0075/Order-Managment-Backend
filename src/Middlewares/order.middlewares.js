import Joi from "joi";
import ApiError from "../utils/ApiError.js";

const validateRequest = (schema, property = "body") => {
    return (req, res, next) => {
        const { error, value } = schema.validate(req[property], {
            abortEarly: false,
            stripUnknown: true
        });

        if (error) {
            const errorMessages = error.details.map((detail) => detail.message);
            throw new ApiError(400, `Validation Error: ${errorMessages.join(", ")}`, errorMessages);
        }

        req[property] = value;
        next();
    };
};

const createOrderSchema = Joi.object({
    orderItems: Joi.array()
        .items(
            Joi.object({
                id: Joi.string().required().messages({
                    "string.empty": "Product ID is required for each order item",
                    "any.required": "Product ID is required for each order item"
                }),
                name: Joi.string().required().messages({
                    "string.empty": "Product name is required for each order item",
                    "any.required": "Product name is required for each order item"
                }),
                price: Joi.alternatives().try(Joi.string(), Joi.number()).required().messages({
                    "any.required": "Price is required for each order item"
                }),
                quantity: Joi.number().integer().min(1).required().messages({
                    "number.min": "Quantity must be at least 1",
                    "number.base": "Quantity must be a valid number",
                    "any.required": "Quantity is required for each order item"
                }),
                image: Joi.string().allow("").optional(),
                category: Joi.string().allow("").optional()
            }).unknown(true))
        .min(1)
        .required()
        .messages({
            "array.min": "orderItems must contain at least one item",
            "any.required": "orderItems is required"
        }),

    deliveryDetails: Joi.object({
        name: Joi.string().trim().min(1).required().messages({
            "string.empty": "Name is required in delivery details"
        }),
        address: Joi.string().trim().min(1).required().messages({
            "string.empty": "Address is required in delivery details"
        }),
        phone: Joi.string().trim().min(1).required().messages({
            "string.empty": "Phone number is required in delivery details"
        })
    }).required(),

    totalAmount: Joi.number().min(0).required().messages({
        "number.min": "Total amount cannot be negative",
        "number.base": "Total amount must be a valid number",
        "any.required": "Total amount is required"
    })
});

export const validateCreateOrder = validateRequest(createOrderSchema, "body");
