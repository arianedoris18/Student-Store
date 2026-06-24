const prisma = require('../db/db')

const listOrders = () =>
  prisma.order.findMany({
    orderBy: { order_id: 'asc' },
    include: { order_items: true },
  })

const getOrder = (order_id) =>
  prisma.order.findUnique({
    where: { order_id },
    include: { order_items: { include: { product: true } } },
  })

const createOrder = async ({ customer_id, status, items }) => {
  return prisma.$transaction(async (tx) => {
    const productIds = items.map((i) => i.product_id)
    const products = await tx.product.findMany({
      where: { id: { in: productIds } },
    })
    const priceById = new Map(products.map((p) => [p.id, p.price]))

    for (const item of items) {
      if (!priceById.has(item.product_id)) {
        throw Object.assign(new Error(`Product ${item.product_id} not found`), {
          code: 'PRODUCT_NOT_FOUND',
        })
      }
    }

    const total_price = items.reduce(
      (sum, i) => sum + priceById.get(i.product_id) * i.quantity,
      0,
    )

    return tx.order.create({
      data: {
        customer_id,
        status: status ?? 'pending',
        total_price,
        order_items: {
          create: items.map((i) => ({
            product_id: i.product_id,
            quantity: i.quantity,
            price: priceById.get(i.product_id),
          })),
        },
      },
      include: { order_items: true },
    })
  })
}

const updateOrder = (order_id, { customer_id, status, total_price }) =>
  prisma.order.update({
    where: { order_id },
    data: { customer_id, status, total_price },
    include: { order_items: true },
  })

const deleteOrder = (order_id) =>
  prisma.order.delete({ where: { order_id } })

module.exports = {
  listOrders,
  getOrder,
  createOrder,
  updateOrder,
  deleteOrder,
}
