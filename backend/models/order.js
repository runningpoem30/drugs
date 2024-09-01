const mongoose = require('mongoose');

const OrderSchema = new mongoose.Schema({
    drug: { type: mongoose.Schema.Types.ObjectId, ref: 'Drug', required: true },
    quantity: { type: Number, required: true },
    orderDate: { type: Date, default: Date.now },
    status: { type: String, enum: ['pending', 'shipped', 'delivered'], default: 'pending' }
});

module.exports = mongoose.model('Order', OrderSchema);