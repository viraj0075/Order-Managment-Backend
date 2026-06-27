import { prisma } from "../Config/db.js";
import { ORDER_STATES } from "../Constants/OrderStates.js";

export const startOrderStatusCron = () => {
    console.log("[Cron] Order Status transition worker started.");

    setInterval(async () => {
        try {
            const activeOrders = await prisma.order.findMany({
                where: {
                    status: {
                        in: [ORDER_STATES.ORDER_RECEIVED, ORDER_STATES.PREPARING, ORDER_STATES.OUT_FOR_DELIVERY]
                    }
                }
            });

            if (activeOrders.length === 0) return;

            for (const order of activeOrders) {
                let nextStatus = null;

                if (order.status === ORDER_STATES.ORDER_RECEIVED) {
                    nextStatus = ORDER_STATES.PREPARING;
                } else if (order.status === ORDER_STATES.PREPARING) {
                    nextStatus = ORDER_STATES.OUT_FOR_DELIVERY;
                } else if (order.status === ORDER_STATES.OUT_FOR_DELIVERY) {
                    nextStatus = ORDER_STATES.DELIVERED;
                }

                if (nextStatus) {
                    await prisma.order.update({
                        where: { orderId: order.orderId },
                        data: { status: nextStatus }
                    });
                    console.log(`[Cron] Order ${order.orderId} status transitioned: ${order.status} -> ${nextStatus}`);
                }
            }
        } catch (error) {
            console.error("[Cron] Error processing order status transition:", error);
        }
    }, 10000);
};

