import { describe, it, expect, vi, beforeEach } from 'vitest';

vi.mock('../Config/db.js', () => {
    return {
        prisma: {
            order: {
                findMany: vi.fn(),
                update: vi.fn()
            }
        }
    };
});

import { prisma } from '../Config/db.js';
import { startOrderStatusCron } from '../Utils/orderCron.js';
import { ORDER_STATES } from '../Constants/OrderStates.js';

describe('Order Status Cron Transitions', () => {
    beforeEach(() => {
        vi.restoreAllMocks();
        vi.useFakeTimers();
    });

    it('should transition orders to correct subsequent states on interval ticks', async () => {
        const mockActiveOrders = [
            { orderId: 'order-rec', status: ORDER_STATES.ORDER_RECEIVED },
            { orderId: 'order-prep', status: ORDER_STATES.PREPARING },
            { orderId: 'order-out', status: ORDER_STATES.OUT_FOR_DELIVERY }
        ];

        prisma.order.findMany.mockResolvedValue(mockActiveOrders);
        prisma.order.update.mockResolvedValue({});

        startOrderStatusCron();

        await vi.advanceTimersByTimeAsync(10000);

        expect(prisma.order.findMany).toHaveBeenCalled();

        expect(prisma.order.update).toHaveBeenCalledWith({
            where: { orderId: 'order-rec' },
            data: { status: ORDER_STATES.PREPARING }
        });

        expect(prisma.order.update).toHaveBeenCalledWith({
            where: { orderId: 'order-prep' },
            data: { status: ORDER_STATES.OUT_FOR_DELIVERY }
        });

        expect(prisma.order.update).toHaveBeenCalledWith({
            where: { orderId: 'order-out' },
            data: { status: ORDER_STATES.DELIVERED }
        });
    });
});
