const Order = require('../models/Order');

// Get all orders for the logged-in user
exports.getMyOrders = async (req, res) => {
    try {
        const orders = await Order.find({ userId: req.user.id })
            .sort({ createdAt: -1 }); // Newest first
        res.json(orders);
    } catch (err) {
        console.error(err.message);
        res.status(500).send('Server Error');
    }
};

// Get single order by ID
exports.getOrderById = async (req, res) => {
    try {
        const order = await Order.findById(req.params.id);

        if (!order) {
            return res.status(404).json({ msg: 'Order not found' });
        }

        // Check user
        if (order.userId.toString() !== req.user.id) {
            return res.status(401).json({ msg: 'User not authorized' });
        }

        res.json(order);
    } catch (err) {
        console.error(err.message);
        if (err.kind === 'ObjectId') {
            return res.status(404).json({ msg: 'Order not found' });
        }
        res.status(500).send('Server Error');
    }
};

// Cancel Order
exports.cancelOrder = async (req, res) => {
    try {
        const order = await Order.findById(req.params.id);

        if (!order) {
            return res.status(404).json({ msg: 'Order not found' });
        }

        if (order.userId.toString() !== req.user.id) {
            return res.status(401).json({ msg: 'User not authorized' });
        }

        // Can only cancel if Processing or Shipped (depends on policy, assumption: not Delivered)
        if (['Delivered', 'Cancelled', 'Returned'].includes(order.orderStatus)) {
            return res.status(400).json({ msg: 'Order cannot be cancelled in its current state' });
        }

        order.orderStatus = 'Cancelled';
        order.dates.cancelled = Date.now();

        // If payment was completed, mark as Refunded (Mock logic)
        if (order.paymentStatus === 'Completed') {
            order.paymentStatus = 'Refunded';
        }

        await order.save();
        res.json(order);
    } catch (err) {
        console.error(err.message);
        res.status(500).send('Server Error');
    }
};

// Return Order
exports.returnOrder = async (req, res) => {
    try {
        const order = await Order.findById(req.params.id);

        if (!order) {
            return res.status(404).json({ msg: 'Order not found' });
        }

        if (order.userId.toString() !== req.user.id) {
            return res.status(401).json({ msg: 'User not authorized' });
        }

        if (order.orderStatus !== 'Delivered') {
            return res.status(400).json({ msg: 'Only delivered orders can be returned' });
        }

        // Logic check: return window? For now, allow all.
        order.orderStatus = 'Returned';
        order.dates.returned = Date.now();
        order.paymentStatus = 'Refunded'; // Assume refund initiated

        await order.save();
        res.json(order);
    } catch (err) {
        console.error(err.message);
        res.status(500).send('Server Error');
    }
};

// --- MOCK / SEED HELPER ---
// Create a fake order (For seeding purposes only)
exports.createMockOrder = async (req, res) => {
    try {
        const { items, totalAmount, shippingAddress } = req.body;

        const newOrder = new Order({
            userId: req.user.id,
            items,
            shippingAddress,
            totalAmount,
            paymentMethod: 'Credit/Debit Card',
            paymentStatus: 'Completed',
            orderStatus: 'Processing',
            dates: {
                placed: Date.now()
            }
        });

        const order = await newOrder.save();
        res.json(order);
    } catch (err) {
        console.error(err.message);
        res.status(500).send('Server Error');
    }
};
