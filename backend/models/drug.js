const mongoose = require('mongoose');

const DrugSchema = new mongoose.Schema({
    name: { type: String, required: true },
    quantity: { type: Number, required: true },
    expirationDate: { type: Date, required: true }
});

module.exports = mongoose.model('Drug', DrugSchema);