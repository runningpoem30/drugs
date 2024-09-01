const express = require('express');
const auth = require('../middleware/auth');
const Order = require('../models/order');
const Drug = require('../models/drug');
const router = express.Router();


app.use(express.json())
// Place a new order
router.post('/place', auth('pharmacist'), async (req, res) => {
    const { drug, quantity } = req.body;
    try {
        const drugDoc = await Drug.findById(drug);
        if (!drugDoc) return res.status(400).json({ msg: 'Drug not found' });

        if (drugDoc.quantity < quantity) return res.status(400).json({ msg: 'Insufficient quantity' });

        const order = new Order({ drug, quantity });
        await order.save();

        // Emit event to notify about new order
        io.emit('newOrder', order);

        res.send(order);
    } catch (err) {
        console.error(err.message);
        res.status(500).send('Server error during order placement');
    }
});

// Get all orders
router.get('/', auth('pharmacist'), async (req, res) => {
    const orders = await Order.find().populate('drug');
    res.send(orders);
});

// Update order status
router.put('/update/:id', auth('vendor'), async (req, res) => {
    const order = await Order.findByIdAndUpdate(req.params.id, req.body, { new: true });
    res.send(order);
});

// Get orders by status
router.get('/status/:status', auth('pharmacist'), async (req, res) => {
    const orders = await Order.find({ status: req.params.status }).populate('drug');
    res.send(orders);
});

module.exports = router;
