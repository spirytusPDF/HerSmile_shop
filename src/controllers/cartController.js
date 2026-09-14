const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

const addToCart = async (req, res) => {
    try{
        const {userId, productId } = req.body;

        const cart = await prisma.cart.findUnique({
            where:{userId: parseInt(userId)}
        });

        if(!cart){
            return res.status(400).send({error: 'No cart found with this id'});
        }

        const newCartItem = await prisma.cartItem.create({
            data: {
                cartId: cart.id,
                productId: parseInt(productId)
            }
        });
        res.status(201).json({ message: 'Item added to cart!', cartItem: newCartItem });
    }catch(error){
        console.error(error);
        res.status(500).send({error: 'Something went wrong with cart'});
    }
}
const getCart = async (req, res) => {
    try {
        const userId = parseInt(req.params.userId);

        const cart = await prisma.cart.findUnique({
            where: { userId },
            include: {
                items: {
                    include: {
                        product: true
                    }
                }
            }
        });

        if (!cart) return res.status(404).json({ error: "Cart not found" });

        res.json(cart);
    } catch (error) {
        console.error(error);
        res.status(500).json({ error: 'Failed to fetch cart.' });
    }
};



const removeFromCart = async (req, res) => {
    try {
        const { userId, productId } = req.body;
        const cart = await prisma.cart.findUnique({
            where: { userId: parseInt(userId) }
        });

        if (!cart) {
            return res.status(404).json({ error: "Cart not found for this user." });
        }

        const existingItem = await prisma.cartItem.findFirst({
            where: {
                cartId: cart.id,
                productId: parseInt(productId)
            }
        });

        if (!existingItem) {
            return res.status(404).json({ error: 'This item is not in your cart.' });
        }
        await prisma.cartItem.delete({
            where: { id: existingItem.id }
        });

        res.json({ message: 'Item successfully removed from your cart!' });

    }
    catch(error){
        console.error(error);
        res.status(500).json({ error: 'Failed to remove item from cart.' });
    }
}
module.exports = { addToCart, getCart,removeFromCart };