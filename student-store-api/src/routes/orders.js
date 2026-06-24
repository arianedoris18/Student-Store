const express = require('express')
const Order = require('../models/order')

const router = express.Router()

router.get('/', async (req, res, next) => {
  try {
    const orders = await Order.listOrders()
    res.json({ orders })
  } catch (err) {
    next(err)
  }
})

router.get('/:order_id', async (req, res, next) => {
  try {
    const order_id = Number(req.params.order_id)
    if (!Number.isInteger(order_id)) return res.status(400).json({ error: 'Invalid order_id' })

    const order = await Order.getOrder(order_id)
    if (!order) return res.status(404).json({ error: 'Order not found' })
    res.json({ order })
  } catch (err) {
    next(err)
  }
})

router.post('/', async (req, res, next) => {
  try {
    const { customer_id, status, items } = req.body ?? {}
    if (customer_id == null) return res.status(400).json({ error: 'customer_id is required' })
    if (!Array.isArray(items) || items.length === 0) {
      return res.status(400).json({ error: 'items must be a non-empty array' })
    }
    for (const item of items) {
      if (!Number.isInteger(item?.product_id) || !Number.isInteger(item?.quantity) || item.quantity < 1) {
        return res.status(400).json({ error: 'each item needs product_id and quantity >= 1' })
      }
    }

    const order = await Order.createOrder({ customer_id, status, items })
    res.status(201).json({ order })
  } catch (err) {
    if (err.code === 'PRODUCT_NOT_FOUND') return res.status(400).json({ error: err.message })
    next(err)
  }
})

router.put('/:order_id', async (req, res, next) => {
  try {
    const order_id = Number(req.params.order_id)
    if (!Number.isInteger(order_id)) return res.status(400).json({ error: 'Invalid order_id' })

    const order = await Order.updateOrder(order_id, req.body ?? {})
    res.json({ order })
  } catch (err) {
    if (err.code === 'P2025') return res.status(404).json({ error: 'Order not found' })
    next(err)
  }
})

router.delete('/:order_id', async (req, res, next) => {
  try {
    const order_id = Number(req.params.order_id)
    if (!Number.isInteger(order_id)) return res.status(400).json({ error: 'Invalid order_id' })

    await Order.deleteOrder(order_id)
    res.json({ message: 'Order deleted' })
  } catch (err) {
    if (err.code === 'P2025') return res.status(404).json({ error: 'Order not found' })
    next(err)
  }
})

module.exports = router
