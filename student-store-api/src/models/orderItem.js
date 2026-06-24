const prisma = require('../db/db')

const listOrderItems = (order_id) =>
  prisma.orderItem.findMany({
    where: order_id ? { order_id } : undefined,
    orderBy: { order_item_id: 'asc' },
  })

const createOrderItem = async ({ order_id, product_id, quantity, price }) => {
  let unitPrice = price
  if (unitPrice == null) {
    const product = await prisma.product.findUnique({ where: { id: product_id } })
    if (!product) {
      throw Object.assign(new Error(`Product ${product_id} not found`), {
        code: 'PRODUCT_NOT_FOUND',
      })
    }
    unitPrice = product.price
  }

  return prisma.orderItem.create({
    data: { order_id, product_id, quantity, price: unitPrice },
  })
}

module.exports = {
  listOrderItems,
  createOrderItem,
}
