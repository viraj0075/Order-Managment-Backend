import { describe, it, expect, vi, beforeEach } from 'vitest';
import { prisma } from '../Config/db.js';
import { createOrder, getAllOrders, getOrderById } from '../Controllers/orders.controllers.js';

// Mock Prisma
vi.mock('../Config/db.js', () => {
    return {
        prisma: {
            order: {
                create: vi.fn(),
                findMany: vi.fn(),
                findUnique: vi.fn()
            }
        }
    };
});

describe('Orders Controller Unit Tests', () => {
    beforeEach(() => {
        vi.restoreAllMocks();
    });

    describe('createOrder', () => {
        it('should create an order successfully and return 201', async () => {
            const req = {
                body: {
                    orderItems: [{ id: '1', name: 'Burger', price: 10, quantity: 2 }],
                    deliveryDetails: { name: 'John Doe', address: '123 St', phone: '1234567890' },
                    totalAmount: 20
                }
            };
            const res = {
                status: vi.fn().mockReturnThis(),
                json: vi.fn()
            };

            const mockCreatedOrder = {
                orderId: 'order-123',
                ...req.body,
                status: 'Order Received',
                createdAt: new Date(),
                updatedAt: new Date()
            };

            prisma.order.create.mockResolvedValue(mockCreatedOrder);

            await createOrder(req, res);

            expect(prisma.order.create).toHaveBeenCalledWith({
                data: req.body
            });
            expect(res.status).toHaveBeenCalledWith(201);
            expect(res.json).toHaveBeenCalled();
        });
    });

    describe('getAllOrders', () => {
        it('should fetch all completed/cancelled orders and return 200', async () => {
            const req = {};
            const res = {
                status: vi.fn().mockReturnThis(),
                json: vi.fn()
            };

            const mockOrders = [
                { orderId: '1', status: 'Delivered', orderItems: [], deliveryDetails: {}, totalAmount: 10 },
                { orderId: '2', status: 'Cancelled', orderItems: [], deliveryDetails: {}, totalAmount: 15 }
            ];

            prisma.order.findMany.mockResolvedValue(mockOrders);

            await getAllOrders(req, res);

            expect(prisma.order.findMany).toHaveBeenCalledWith({
                where: {
                    status: {
                        in: ["Delivered", "Cancelled"]
                    }
                },
                orderBy: {
                    createdAt: "desc"
                }
            });
            expect(res.status).toHaveBeenCalledWith(200);
            expect(res.json).toHaveBeenCalled();
        });
    });

    describe('getOrderById', () => {
        it('should fetch order by ID successfully and return 200', async () => {
            const req = { params: { id: 'order-123' } };
            const res = {
                status: vi.fn().mockReturnThis(),
                json: vi.fn()
            };

            const mockOrder = { orderId: 'order-123', status: 'Preparing', orderItems: [], deliveryDetails: {}, totalAmount: 10 };
            prisma.order.findUnique.mockResolvedValue(mockOrder);

            await getOrderById(req, res);

            expect(prisma.order.findUnique).toHaveBeenCalledWith({
                where: { orderId: 'order-123' }
            });
            expect(res.status).toHaveBeenCalledWith(200);
            expect(res.json).toHaveBeenCalled();
        });

        it('should throw error if order is not found', async () => {
            const req = { params: { id: 'invalid-id' } };
            const res = {
                status: vi.fn().mockReturnThis(),
                json: vi.fn()
            };

            prisma.order.findUnique.mockResolvedValue(null);

            await expect(getOrderById(req, res)).rejects.toThrow('Order not found');
        });
    });
});
