const express = require('express')
const productModel = require('../models/product')

const router = express.Router()

router.get('/', productModel.getProducts)
router.get('/:id', productModel.getProductById)
router.post('/', productModel.createProduct)
router.put('/', productModel.updateProduct)
router.put('/:id', productModel.updateProduct)
router.delete('/:id', productModel.deleteProduct)

module.exports = router
