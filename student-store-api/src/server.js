require('dotenv').config()

const express = require('express')
const cors = require('cors')

const productsRouter = require('./routes/products')
const ordersRouter = require('./routes/orders')
//this is a test

const app = express()

app.use(cors())
app.use(express.json())

app.get('/', (req, res) => res.json({ message: 'Student Store API' }))

app.use('/products', productsRouter)
app.use('/orders', ordersRouter)

app.use((req, res) => res.status(404).json({ error: 'Not found' }))

app.use((err, req, res, next) => {
  console.error(err)
  res.status(500).json({ error: 'Internal server error' })
})

const PORT = process.env.PORT || 4000
app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`)
})