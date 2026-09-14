const express = require('express');
const router = express.Router();
const orderController = require('../controllers/orderController');


router.post('/checkout', orderController.checkout);
router.get('/user/:userId', orderController.getOrders);
module.exports = router;