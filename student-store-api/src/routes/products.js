const express = require('express')
const Product = require('../models/product')

const router = express.Router()

router.get('/', async (req, res, next) => {
  try {
    const products = await Product.listProducts()
    res.json({ products })
  } catch (err) {
    next(err)
  }
})

router.get('/:id', async (req, res, next) => {
  try {
    const id = Number(req.params.id)
    if (!Number.isInteger(id)) return res.status(400).json({ error: 'Invalid id' })

    const product = await Product.getProduct(id)
    if (!product) return res.status(404).json({ error: 'Product not found' })
    res.json({ product })
  } catch (err) {
    next(err)
  }
})

router.post('/', async (req, res, next) => {
  try {
    const { name, description, price, image_url, category } = req.body ?? {}
    if (!name || price == null) {
      return res.status(400).json({ error: 'name and price are required' })
    }
    const product = await Product.createProduct({ name, description, price, image_url, category })
    res.status(201).json({ product })
  } catch (err) {
    next(err)
  }
})

router.put('/:id', async (req, res, next) => {
  try {
    const id = Number(req.params.id)
    if (!Number.isInteger(id)) return res.status(400).json({ error: 'Invalid id' })

    const product = await Product.updateProduct(id, req.body ?? {})
    res.json({ product })
  } catch (err) {
    if (err.code === 'P2025') return res.status(404).json({ error: 'Product not found' })
    next(err)
  }
})

router.delete('/:id', async (req, res, next) => {
  try {
    const id = Number(req.params.id)
    if (!Number.isInteger(id)) return res.status(400).json({ error: 'Invalid id' })

    await Product.deleteProduct(id)
    res.json({ message: 'Product deleted' })
  } catch (err) {
    if (err.code === 'P2025') return res.status(404).json({ error: 'Product not found' })
    next(err)
  }
})

module.exports = router
