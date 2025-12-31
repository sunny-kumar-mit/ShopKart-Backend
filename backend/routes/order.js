const express = require('express');
const router = express.Router();
const auth = require('../middleware/auth');
const orderController = require('../controllers/orderController');

// All routes are protected
router.use(auth);

router.get('/', orderController.getMyOrders);
router.post('/mock', orderController.createMockOrder); // Temporary seeded route
router.get('/:id', orderController.getOrderById);
router.patch('/:id/cancel', orderController.cancelOrder);
router.patch('/:id/return', orderController.returnOrder);

module.exports = router;
