import express from "express";
import { getProductsByCategory } from "../Controllers/products.controllers.js";

const router = express.Router();

router.get("/:category", getProductsByCategory);

export default router;