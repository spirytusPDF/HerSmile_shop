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

app.use('/api/products', productRoutes);


app.listen(PORT, () => {
    console.log(`HerSmile Server running at http://localhost:${PORT}`);
});