const express = require('express')
const orderModel = require('../models/order')

const router = express.Router()

router.get('/', orderModel.getOrders)
router.get('/:order_id', orderModel.getOrderById)
router.post('/', orderModel.createOrder)
router.put('/:order_id', orderModel.updateOrder)
router.delete('/:order_id', orderModel.deleteOrder)

module.exports = router
