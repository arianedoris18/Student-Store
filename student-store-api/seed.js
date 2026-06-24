const { PrismaClient } = require('@prisma/client')
const prisma = new PrismaClient()
const fs = require('fs')
const path = require('path')

const DUMMY_PRODUCTS = [
  {
    name: 'Campus Backpack',
    description: 'Spacious backpack with laptop sleeve and water resistance.',
    price: 39.99,
    image_url: 'https://dummyimage.com/600x400/4f46e5/ffffff&text=Backpack',
    category: 'Accessories',
  },
  {
    name: 'Study Lamp',
    description: 'LED desk lamp with adjustable brightness for late-night study.',
    price: 24.5,
    image_url: 'https://dummyimage.com/600x400/0ea5e9/ffffff&text=Lamp',
    category: 'Supplies',
  },
  {
    name: 'Water Bottle',
    description: 'Insulated bottle that keeps drinks cold for up to 12 hours.',
    price: 14.99,
    image_url: 'https://dummyimage.com/600x400/10b981/ffffff&text=Bottle',
    category: 'Accessories',
  },
  {
    name: 'Graph Notebook',
    description: 'A5 graph notebook ideal for math and engineering classes.',
    price: 5.49,
    image_url: 'https://dummyimage.com/600x400/f59e0b/ffffff&text=Notebook',
    category: 'Books',
  },
]

const DUMMY_ORDERS = [
  {
    customer_id: 501,
    total_price: 64.48,
    status: 'completed',
    created_at: '2026-06-20T09:30:00Z',
    items: [
      { product_id: 1, quantity: 1, price: 39.99 },
      { product_id: 4, quantity: 1, price: 5.49 },
      { product_id: 3, quantity: 1, price: 14.99 },
    ],
  },
  {
    customer_id: 502,
    total_price: 49.0,
    status: 'pending',
    created_at: '2026-06-22T14:15:00Z',
    items: [
      { product_id: 2, quantity: 2, price: 24.5 },
    ],
  },
]

function getDummyDate(index = 0) {
  const date = new Date()
  date.setDate(date.getDate() - (index + 1) * 2)
  date.setHours(10, 0, 0, 0)
  return date
}

function readJsonOrFallback(relativePath, fallbackValue, label) {
  try {
    const filePath = path.join(__dirname, relativePath)
    return JSON.parse(fs.readFileSync(filePath, 'utf8'))
  } catch (error) {
    console.warn(`⚠️ Using built-in dummy ${label} data: ${error.message}`)
    return fallbackValue
  }
}

async function seed() {
  try {
    console.log('🌱 Seeding database...\n')

    // Clear existing data (in order due to relations)
    await prisma.orderItem.deleteMany()
    await prisma.order.deleteMany()
    await prisma.product.deleteMany()

    // Load JSON data (fallback to built-in dummy data for testing)
    const productsData = readJsonOrFallback(
      './data/products.json',
      { products: DUMMY_PRODUCTS },
      'product'
    )

    const ordersData = readJsonOrFallback(
      './data/orders.json',
      { orders: DUMMY_ORDERS },
      'order'
    )

    // Seed products
    for (const product of productsData.products) {
      await prisma.product.create({
        data: {
          name: product.name,
          description: product.description,
          price: product.price,
          image_url: product.image_url,
          category: product.category,
        },
      })
    }

    // Seed orders and items
    for (const [index, order] of ordersData.orders.entries()) {
      const parsedDate = order.created_at ? new Date(order.created_at) : null
      const seededDate =
        parsedDate && !Number.isNaN(parsedDate.getTime())
          ? parsedDate
          : getDummyDate(index)

      const createdOrder = await prisma.order.create({
        data: {
          customer_id: order.customer_id,
          total_price: order.total_price,
          status: order.status,
          created_at: seededDate,
          order_items: {
            create: order.items.map((item) => ({
              product_id: item.product_id,
              quantity: item.quantity,
              price: item.price,
            })),
          },
        },
      })

      console.log(`✅ Created order #${createdOrder.order_id}`)
    }

    console.log('\n🎉 Seeding complete!')
  } catch (err) {
    console.error('❌ Error seeding:', err)
  } finally {
    await prisma.$disconnect()
  }
}

seed()
