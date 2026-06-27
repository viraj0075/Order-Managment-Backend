import { describe, it, expect, vi, beforeEach } from 'vitest';
import request from 'supertest';
import express from 'express';

vi.mock('../Config/db.js', () => {
    return {
        prisma: {
            order: {
                create: vi.fn(),
                findMany: vi.fn(),
                findUnique: vi.fn(),
                update: vi.fn(),
            }
        },
        connectDB: vi.fn(),
        disconnectDB: vi.fn()
    };
});

import { prisma } from '../Config/db.js';
import orderRoutes from '../Routes/orders.routes.js';
import ApiError from '../Utils/ApiError.js';

const app = express();
app.use(express.json());
app.use('/orders', orderRoutes);

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

describe('Orders API Endpoints', () => {
    beforeEach(() => {
        vi.restoreAllMocks();
    });

    describe('POST /orders/create', () => {
        const validOrderData = {
            orderItems: [
                {
                    id: 'product-1',
                    name: 'Classic Cheeseburger',
                    price: '$12.99',
                    quantity: 2,
                    image: 'https://example.com/burger.png',
                    category: 'Burgers'
                }
            ],
            deliveryDetails: {
                name: 'John Doe',
                address: '123 Main Street, New York, NY 10001',
                phone: '1234567890'
            },
            totalAmount: 25.98
        };

        it('should create an order successfully with valid input data', async () => {
            const mockCreatedOrder = {
                orderId: 'uuid-12345',
                status: 'Order Received',
                ...validOrderData,
                createdAt: new Date().toISOString(),
                updatedAt: new Date().toISOString()
            };

            prisma.order.create.mockResolvedValue(mockCreatedOrder);

            const response = await request(app)
                .post('/orders/create')
                .send(validOrderData);

            expect(response.status).toBe(201);
            expect(response.body.success).toBe(true);
            expect(response.body.data.orderId).toBe('uuid-12345');
            expect(response.body.data.status).toBe('Order Received');
            expect(prisma.order.create).toHaveBeenCalledTimes(1);
        });

        it('should return 400 validation error if orderItems is empty', async () => {
            const invalidData = {
                ...validOrderData,
                orderItems: []
            };

            const response = await request(app)
                .post('/orders/create')
                .send(invalidData);

            expect(response.status).toBe(400);
            expect(response.body.success).toBe(false);
            expect(response.body.message).toContain('Validation Error');
            expect(response.body.errors).toContain('orderItems must contain at least one item');
            expect(prisma.order.create).not.toHaveBeenCalled();
        });

        it('should return 400 validation error if delivery details are missing', async () => {
            const invalidData = {
                orderItems: validOrderData.orderItems,
                totalAmount: 25.98
            };

            const response = await request(app)
                .post('/orders/create')
                .send(invalidData);

            expect(response.status).toBe(400);
            expect(response.body.success).toBe(false);
            expect(prisma.order.create).not.toHaveBeenCalled();
        });

        it('should return 400 validation error if totalAmount is negative', async () => {
            const invalidData = {
                ...validOrderData,
                totalAmount: -5.00
            };

            const response = await request(app)
                .post('/orders/create')
                .send(invalidData);

            expect(response.status).toBe(400);
            expect(response.body.success).toBe(false);
            expect(response.body.errors).toContain('Total amount cannot be negative');
            expect(prisma.order.create).not.toHaveBeenCalled();
        });
    });

    describe('GET /orders/:id', () => {
        it('should return 200 and the order data when the order exists', async () => {
            const mockOrder = {
                orderId: 'uuid-12345',
                status: 'Preparing',
                orderItems: [],
                deliveryDetails: {},
                totalAmount: 15.00,
                createdAt: new Date().toISOString(),
                updatedAt: new Date().toISOString()
            };

            prisma.order.findUnique.mockResolvedValue(mockOrder);

            const response = await request(app).get('/orders/uuid-12345');

            expect(response.status).toBe(200);
            expect(response.body.success).toBe(true);
            expect(response.body.data.orderId).toBe('uuid-12345');
            expect(prisma.order.findUnique).toHaveBeenCalledWith({
                where: { orderId: 'uuid-12345' }
            });
        });

        it('should return 404 when the order does not exist', async () => {
            prisma.order.findUnique.mockResolvedValue(null);

            const response = await request(app).get('/orders/invalid-id');

            expect(response.status).toBe(404);
            expect(response.body.success).toBe(false);
            expect(response.body.message).toBe('Order not found');
        });
    });

    describe('GET /orders/list', () => {
        it('should return 200 and list completed/cancelled orders', async () => {
            const mockOrders = [
                { orderId: 'order-1', status: 'Delivered', totalAmount: 10 },
                { orderId: 'order-2', status: 'Cancelled', totalAmount: 20 }
            ];

            prisma.order.findMany.mockResolvedValue(mockOrders);

            const response = await request(app).get('/orders/list');

            expect(response.status).toBe(200);
            expect(response.body.success).toBe(true);
            expect(response.body.data).toHaveLength(2);
            expect(prisma.order.findMany).toHaveBeenCalledWith({
                where: {
                    status: {
                        in: ['Delivered', 'Cancelled']
                    }
                },
                orderBy: {
                    createdAt: 'desc'
                }
            });
        });
    });
});
