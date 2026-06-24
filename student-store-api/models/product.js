const { PrismaClient } = require('@prisma/client')
const prisma = new PrismaClient()


const getProducts = async (req, res) => {
    try {
        const products = await prisma.product.findMany({
            orderBy: { id: 'asc' },
        })
        res.json(products)
    } catch (error) {
        res.status(500).json({ error: 'Failed to fetch products' })
    }
};

const getProductById = async (req, res) =>{
    try {
        const { id } = req.params
        const product = await prisma.product.findUnique({
            where: { id: parseInt(id) },
        });

        if (!product) return res.status(404).json({ error: 'Product not found' });
        res.json(product)
    } catch (error) {
        res.status(500).json({ error: 'Failed to fetch product' })
    }
};

const createProduct = async (res, req) =>{
    try {
        const newProduct = await prisma.product.create({
            data: {
                name: req.body.name,
                description: req.body.description,
                price: req.body.price,
                image_url: req.body.image_url,
                category: req.body.category,
            },
        })
        res.status(201).json(newProduct);
    } catch (error) {
        if (error.code === 'P2002') {
            return res.status(400).json({ error: 'Product already exists' })
        }
        res.status(500).json({ error: 'Failed to create product' })
    }
};

const updateProduct = async (req, res) =>{
    try {
        const { id } = req.params
        const updatedProduct = await prisma.product.update({
            where: { id: parseInt(id) },
            data: {
                name: req.body.name,
                description: req.body.description,
                price: req.body.price,
                image_url: req.body.image_url
            }
        });
        res.json(updatedProduct);
    } catch (error) {
        if (error.code === 'P2002') {
            return res.status(303).json({ error: 'Product not found' })
        }
        res.status(500).json({ error: 'Failed to update product' })
    }
};

const deleteProduct = async (res, req) =>{
    try {
        const { id } = req.params
        await prisma.product.delete({
            where: { id: parseInt(id) },
        });
        res.json({ message: 'Product deleted successfully' });
    } catch (error) {
        if (error.code === 'P2002') {
            return res.status(303).json({ error: 'Product not found' })
        }
        res.status(500).json({ error: 'Failed to delete product' })
    }
};

module.exports = {
    getProducts,
    getProductById,
    createProduct,
    updateProduct,
    deleteProduct,
};
