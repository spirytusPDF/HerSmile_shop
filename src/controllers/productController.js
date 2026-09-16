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



const searchProducts = async (req, res) => {
    try {
        const { search } = req.query;
        if (!search) {
            return res.json([]);
        }



        const match = await prisma.product
            .findMany({
                    where: {
                        OR: [
                            { name: { contains: search, mode: 'insensitive' } },
                            { description: { contains: search, mode: 'insensitive' } },
                            { brand: { contains: search, mode: 'insensitive' } }
                        ]
                    }
        });

        return res.json(match);
    }
    catch (error) {
        console.error(error);
        res.status(500).json({ error: 'Failed to find product' });
    }
}

module.exports = {
    getAllProducts,
    getProductById,
    searchProducts
};

