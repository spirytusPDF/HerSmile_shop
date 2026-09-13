const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

const getAllProducts = async (req, res) => {
    try {
        const { category } = req.query;
        const filter = category ? { where: { category } } : {};

        const products = await prisma.product.findMany(filter);
        res.json(products);
    } catch (error) {
        console.error(error);
        res.status(500).json({ error: 'Failed to fetch products' });
    }
};



const getProductById = async (req, res) => {
    try {
        const productId = parseInt(req.params.id);

        const product = await prisma.product.findUnique({
            where: { id: productId }
        });
        if (!product) {
            return res.status(404).json({ error: 'Product not found' });
        }

        res.json(product);
    } catch (error) {
        console.error(error);
        res.status(500).json({ error: 'Failed to fetch the product' });
    }
};

module.exports = {
    getAllProducts,
    getProductById
};