const prisma = require('../db/db')
const { OrderItem } = require('./orderItem')

const parseOrderPayload = (body) => {
  const customerId = Number(body.customer_id)
  const items = Array.isArray(body.items) ? body.items : []
  const status = body.status || 'pending'

  if (!Number.isInteger(customerId) || customerId <= 0) {
    return { error: 'customer_id must be a positive integer' }
  }

  if (!items.length) {
    return { error: 'items must include at least one order item' }
  }

  for (const item of items) {
    const productId = Number(item.product_id)
    const quantity = Number(item.quantity)
    const price = Number(item.price)

    if (!Number.isInteger(productId) || productId <= 0) {
      return { error: 'Each item must include a valid product_id' }
    }

    if (!Number.isInteger(quantity) || quantity <= 0) {
      return { error: 'Each item must include a positive quantity' }
    }

    if (!Number.isFinite(price) || price < 0) {
      return { error: 'Each item must include a valid price' }
    }
  }

  const totalPrice = items.reduce(
    (sum, item) => sum + Number(item.price) * Number(item.quantity),
    0
  )

  return {
    customerId,
    status,
    totalPrice,
    items,
  }
}

class Order {
  static async getAll() {
    return prisma.order.findMany({
      orderBy: { order_id: 'asc' },
      include: { order_items: true },
    })
  }

  static async getById(orderId) {
    return this.getByIdWithItems(orderId)
  }

  static async getByIdWithItems(orderId) {
    return prisma.order.findUnique({
      where: { order_id: Number(orderId) },
      include: { order_items: true },
    })
  }

  static async create(payload) {
    return prisma.$transaction(async (tx) => {
      const order = await tx.order.create({
        data: {
          customer_id: payload.customerId,
          total_price: payload.totalPrice,
          status: payload.status,
        },
      })

      await OrderItem.createMany(order.order_id, payload.items, tx)

      return tx.order.findUnique({
        where: { order_id: order.order_id },
        include: { order_items: true },
      })
    })
  }

  static async update(orderId, data) {
    return prisma.order.update({
      where: { order_id: Number(orderId) },
      data,
      include: { order_items: true },
    })
  }

  static async delete(orderId) {
    return prisma.order.delete({
      where: { order_id: Number(orderId) },
    })
  }
}

const getOrders = async (req, res) => {
  try {
    const orders = await Order.getAll()
    res.json(orders)
  } catch (error) {
    res.status(500).json({ error: 'Failed to fetch orders' })
  }
}

const getOrderById = async (req, res) => {
  try {
    const { order_id } = req.params
    const order = await Order.getById(order_id)

    if (!order) return res.status(404).json({ error: 'Order not found' })
    res.json(order)
  } catch (error) {
    res.status(500).json({ error: 'Failed to fetch order' })
  }
}

const createOrder = async (req, res) => {
  const payload = parseOrderPayload(req.body)
  if (payload.error) {
    return res.status(400).json({ error: payload.error })
  }

  try {
    const order = await Order.create(payload)

    res.status(201).json(order)
  } catch (error) {
    if (error.code === 'P2003') {
      return res.status(400).json({ error: 'Invalid product_id in order items' })
    }
    res.status(500).json({ error: 'Failed to create order' })
  }
}

const updateOrder = async (req, res) => {
  const { order_id } = req.params
  const { status, customer_id } = req.body
  const data = {}

  if (status) data.status = status
  if (customer_id !== undefined) data.customer_id = Number(customer_id)

  if (!Object.keys(data).length) {
    return res.status(400).json({ error: 'Provide at least one field to update' })
  }

  try {
    const order = await Order.update(order_id, data)
    res.json(order)
  } catch (error) {
    if (error.code === 'P2025') {
      return res.status(404).json({ error: 'Order not found' })
    }
    res.status(500).json({ error: 'Failed to update order' })
  }
}

const deleteOrder = async (req, res) => {
  try {
    await Order.delete(req.params.order_id)
    res.json({ message: 'Order deleted successfully' })
  } catch (error) {
    if (error.code === 'P2025') {
      return res.status(404).json({ error: 'Order not found' })
    }
    res.status(500).json({ error: 'Failed to delete order' })
  }
}

module.exports = {
  Order,
  getOrders,
  getOrderById,
  createOrder,
  updateOrder,
  deleteOrder,
}
