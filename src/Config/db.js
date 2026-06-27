import { PrismaClient } from "../generated/prisma/client.js"
import { PrismaPg } from "@prisma/adapter-pg"
import pg from "pg";

const pool = new pg.Pool({
    connectionString: process.env.DATABASE_URL
});
const adapter = new PrismaPg(pool);


export const prisma = new PrismaClient({
    adapter, log: process.env.NODE_ENV === "development"
        ? ["query", "error", "warn"]
        : ["error"],
});

export const connectDB = async () => {
    try {
        await prisma.$connect();
        console.log("Database connected successfully via Prisma");
    }
    catch (error) {
        console.log("Error connecting to database via Prisma", error)
        process.exit(1);
    }
}

export const disconnectDB = async () => {
    try {
        await prisma.$disconnect();
        console.log("Database disconnected successfully via Prisma");
    }
    catch (error) {
        console.log("Error disconnecting from database via Prisma", error)
        process.exit(1);
    }
}