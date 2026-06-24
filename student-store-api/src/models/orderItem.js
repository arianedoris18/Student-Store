const prisma = require('../db/db')

class OrderItem {
  static async createMany(orderId, items, dbClient = prisma) {
    if (!Array.isArray(items) || !items.length) return []

    await dbClient.orderItem.createMany({
      data: items.map((item) => ({
        order_id: Number(orderId),
        product_id: Number(item.product_id),
        quantity: Number(item.quantity),
        price: Number(item.price),
      })),
    })

    return this.getByOrderId(orderId, dbClient)
  }

  static async getByOrderId(orderId, dbClient = prisma) {
    return dbClient.orderItem.findMany({
      where: { order_id: Number(orderId) },
      orderBy: { order_item_id: 'asc' },
    })
  }
}

module.exports = {
  OrderItem,
}
