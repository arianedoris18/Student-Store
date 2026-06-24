const express = require('express'); // imported the express
const app = express();
const productModel = require('./models/product');
app.use(express.json());

app.get('/products', productModel.getProducts);
app.get('/products/:id', productModel.getProductById);
app.post('/products', productModel.createProduct);
app.put('/products/:id', productModel.updateProduct);
app.delete('/products/:id', productModel.deleteProduct);

const PORT = process.env.PORT || 3000;
app.listen(PORT, () => {
    console.log(`Server is running on port ${PORT}`);
});