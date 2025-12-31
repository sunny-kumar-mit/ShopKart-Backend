const Razorpay = require('razorpay');
const crypto = require('crypto');
const Order = require('../models/Order');

// Initialize Razorpay
const razorpay = new Razorpay({
    key_id: process.env.RAZORPAY_KEY_ID,
    key_secret: process.env.RAZORPAY_KEY_SECRET
});

// Create Order (Initiate Payment)
exports.createOrder = async (req, res) => {
    try {
        const { amount } = req.body; // Amount in INR

        const options = {
            amount: amount * 100, // Amount in paise
            currency: "INR",
            receipt: `receipt_order_${Date.now()}`
        };

        const order = await razorpay.orders.create(options);

        if (!order) return res.status(500).send("Some error occured");

        res.json(order);
    } catch (error) {
        console.error(error);
        res.status(500).send(error);
    }
};

// Verify Payment and Save Order
exports.verifyPayment = async (req, res) => {
    try {
        const {
            razorpay_order_id,
            razorpay_payment_id,
            razorpay_signature,
            orderData // The actual order details (items, address, etc.) passed from frontend
        } = req.body;

        const body = razorpay_order_id + "|" + razorpay_payment_id;

        const expectedSignature = crypto
            .createHmac('sha256', process.env.RAZORPAY_KEY_SECRET)
            .update(body.toString())
            .digest('hex');

        const isAuthentic = expectedSignature === razorpay_signature;

        if (isAuthentic) {
            // Payment Success -> Create Order in DB
            const newOrder = new Order({
                userId: req.user.id,
                items: orderData.items,
                shippingAddress: orderData.shippingAddress,
                totalAmount: orderData.totalAmount,
                paymentMethod: 'UPI', // Or derive from razorpay logic if needed, simplify to Online/UPI/Card
                paymentStatus: 'Completed',
                orderStatus: 'Processing',
                razorpayOrderId: razorpay_order_id,
                razorpayPaymentId: razorpay_payment_id,
                razorpaySignature: razorpay_signature,
                dates: {
                    placed: Date.now()
                }
            });

            await newOrder.save();

            res.json({
                msg: "success",
                orderId: newOrder._id
            });
        } else {
            res.status(400).json({
                msg: "failure"
            });
        }
    } catch (error) {
        console.error(error);
        res.status(500).send("Server Error");
    }
};
