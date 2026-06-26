const prisma = require('../db/db')// imports prisma client and connects to db.js


class Product { // creates Class Product this groups db methods and keeps raw db separateed from the HTTP routes
  static async getAll(query = {}) {// fetches many products from the database
    const where = {}
    let orderBy

    if (query.category) {// filters products by category if category is provided in the query
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

  static async getById(id) {// fetches a single product from the database by id
    return prisma.product.findUnique({// finds the product with the given id
      where: { id: Number(id) },// changes id into a number
    })// returns the product with the given id
  }

  static async create(data) {
    return prisma.product.create({// creates a new product in the database
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

// we move on to controller handlers
const getProducts = async (req, res) => { // express handler for list endpoint.
    try {
        const products = await Product.getAll(req.query)
        res.json(products)
    } catch (error) {
        res.status(500).json({ error: 'Failed to fetch products' })
    }
};

const getProductById = async (req, res) =>{
    try {
        const { id } = req.params// extracts the id from the request parameters
        const product = await Product.getById(id);// fetches a single product from the database by id

        if (!product) return res.status(404).json({ error: 'Product not found' });
        res.json(product)
    } catch (error) {
        res.status(500).json({ error: 'Failed to fetch product' })
    }
};

const createProduct = async (req, res) =>{
    try {
        const newProduct = await Product.create(req.body);// creates a new product in the database
        res.status(201).json(newProduct);// returns the new product
    } catch (error) {
        if (error.code === 'P2002') {
            return res.status(400).json({ error: 'Product already exists' })
        }
        res.status(500).json({ error: 'Failed to create product' })
    }
};

const updateProduct = async (req, res) =>{
    try {
        const id = req.params.id ?? req.body.id // support /products/:id and /products with id in body
        if (!id) {
            return res.status(400).json({ error: 'Product id is required' })
        }
        const updatedProduct = await Product.update(id, req.body);// updates a product in the database
        res.json(updatedProduct);// returns the updated product
    } catch (error) {
        if (error.code === 'P2025') {//
            return res.status(404).json({ error: 'Product not found' })
        }
       
        res.status(500).json({ error: 'Failed to update product' })
    }
};

const deleteProduct = async (req, res) =>{
    try {
        const { id } = req.params
        const deletedProduct = await Product.delete(id);// deletes a product from the database
        res.json({ message: 'Product deleted successfully' });
    } catch (error) {
        if (error.code === 'P2025') {
            return res.status(404).json({ error: 'Product not found' })
        }
        res.status(500).json({ error: 'Failed to delete product' })
    }
};

//Exporting and connecting the gile to routes. 
module.exports = {
    Product,// for reusing and testig or direct model use. 
    getProducts,// for listing all products. 
    getProductById,// for fetching a single product by id. 
    createProduct,
    updateProduct,// for updating a product by id. 
    deleteProduct,// for deleting a product by id. 
};
