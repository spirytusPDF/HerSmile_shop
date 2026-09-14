const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

const checkout = async (req, res) => {
    try {
        const { userId } = req.body;

        const cart = await prisma.cart.findUnique({
            where: { userId: parseInt(userId) },
            include: {
                items: {
                    include: { product: true }
                }
            }
        });

        if (!cart || cart.items.length === 0) {
            return res.status(400).json({ error: "Cannot place order. Your cart is empty!" });
        }


        let orderTotal = 0;
        cart.items.forEach(item => {
            orderTotal += item.product.price;
        });


        const newOrder = await prisma.order.create({
            data: {
                userId: parseInt(userId),
                total: parseFloat(orderTotal.toFixed(2)),
                items: {
                    create: cart.items.map(item => ({
                        productId: item.productId,
                        price: item.product.price
                    }))
                }
            }
        });


        await prisma.cartItem.deleteMany({
            where: { cartId: cart.id }
        });

        res.status(201).json({
            message: 'Order placed successfully!',
            order: newOrder
        });
    } catch (error) {
        console.error(error);
        res.status(500).json({ error: 'Failed to process checkout.' });
    }
};

const getOrders = async (req, res) => {
    try {
        const userId = parseInt(req.params.userId);

        const orders = await prisma.order.findMany({
            where: { userId: userId },
            include: {
                items: {
                    include: {
                        product: true
                    }
                }
            },
            orderBy: {
                createdAt: 'desc'
            }
        });

        if (!orders || orders.length === 0) {
            return res.status(404).json({ message: "No past orders found." });
        }

        res.json(orders);
    } catch (error) {
        console.error(error);
        res.status(500).json({ error: 'Failed to fetch order history.' });
    }
}

module.exports = { checkout, getOrders };