const express = require('express');
const path = require('path');

const productRoutes = require('./routes/productRoutes');

const app = express();
const PORT = process.env.PORT || 3000;

app.use(express.json());
app.use(express.static(path.join(__dirname, '../public')));

app.get('/api/health', (req, res) => {
    res.json({ status: 'ok', message: 'HerSmile API is running smoothly' });
});

const cartRoutes = require('./routes/cartRoutes');

app.use('/api/cart', cartRoutes);

app.use('/api/products', productRoutes);
const authRoutes = require('./routes/authRoutes');
app.use('/api/auth', authRoutes);

const orderRoutes = require('./routes/orderRoutes');

app.use('/api/orders', orderRoutes);

const aiRoutes = require('./routes/aiRoutes');
app.use('/api/chat', aiRoutes);

app.listen(PORT, () => {
    console.log(`HerSmile Server running at http://localhost:${PORT}`);
});