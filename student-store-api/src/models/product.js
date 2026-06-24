const prisma = require('../db/db')

class Product {
  static async getAll(query = {}) {
    const where = {}
    let orderBy

    if (query.category) {
      where.category = query.category
    }

    if (query.sort === 'price' || query.sort === 'name') {
      orderBy = { [query.sort]: 'asc' }
    }

    return prisma.product.findMany({
      where,
      orderBy,
    })
  }

  static async getById(id) {
    return prisma.product.findUnique({
      where: { id: Number(id) },
    })
  }

  static async create(data) {
    return prisma.product.create({
      data: {
        name: data.name,
        description: data.description,
        price: data.price,
        image_url: data.image_url,
        category: data.category,
      },
    })
  }

  static async update(id, data) {
    return prisma.product.update({
      where: { id: Number(id) },
      data: {
        name: data.name,
        description: data.description,
        price: data.price,
        image_url: data.image_url,
        category: data.category,
      },
    })
  }

  static async delete(id) {
    return prisma.product.delete({
      where: { id: Number(id) },
    })
  }
}


const getProducts = async (req, res) => {
    try {
        const products = await Product.getAll(req.query)
        res.json(products)
    } catch (error) {
        res.status(500).json({ error: 'Failed to fetch products' })
    }
};

const getProductById = async (req, res) =>{
    try {
        const { id } = req.params
        const product = await Product.getById(id);

        if (!product) return res.status(404).json({ error: 'Product not found' });
        res.json(product)
    } catch (error) {
        res.status(500).json({ error: 'Failed to fetch product' })
    }
};

const createProduct = async (req, res) =>{
    try {
        const newProduct = await Product.create(req.body)
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
        const updatedProduct = await Product.update(id, req.body);
        res.json(updatedProduct);
    } catch (error) {
        if (error.code === 'P2025') {
            return res.status(404).json({ error: 'Product not found' })
        }
       
        res.status(500).json({ error: 'Failed to update product' })
    }
};

const deleteProduct = async (req, res) =>{
    try {
        const { id } = req.params
        await Product.delete(id);
        res.json({ message: 'Product deleted successfully' });
    } catch (error) {
        if (error.code === 'P2025') {
            return res.status(404).json({ error: 'Product not found' })
        }
        res.status(500).json({ error: 'Failed to delete product' })
    }
};

module.exports = {
    Product,
    getProducts,
    getProductById,
    createProduct,
    updateProduct,
    deleteProduct,
};
