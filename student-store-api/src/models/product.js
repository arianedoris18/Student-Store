const prisma = require('../db/db')

const listProducts = () =>
  prisma.product.findMany({ orderBy: { id: 'asc' } })

const getProduct = (id) =>
  prisma.product.findUnique({ where: { id } })

const createProduct = ({ name, description, price, image_url, category }) =>
  prisma.product.create({
    data: { name, description, price, image_url, category },
  })

const updateProduct = (id, { name, description, price, image_url, category }) =>
  prisma.product.update({
    where: { id },
    data: { name, description, price, image_url, category },
  })

const deleteProduct = (id) =>
  prisma.product.delete({ where: { id } })

module.exports = {
  listProducts,
  getProduct,
  createProduct,
  updateProduct,
  deleteProduct,
}
