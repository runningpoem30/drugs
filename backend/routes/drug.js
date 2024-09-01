const express = require('express');
const auth = require('../middleware/auth');
const Drug = require('../models/drug');
const router = express.Router();

// Add a new drug
router.post('/add', auth('pharmacist'), async (req, res) => {
    const { name, quantity, expirationDate } = req.body;
    const drug = new Drug({ name, quantity, expirationDate });
    await drug.save();
    res.send(drug);
});

// Get all drugs with pagination
router.get('/', auth('pharmacist'), async (req, res) => {
    const { page = 1, limit = 10 } = req.query;
    const drugs = await Drug.find()
        .skip((page - 1) * limit)
        .limit(limit);
    res.send(drugs);
});

// Update drug quantity
router.put('/update/:id', auth('pharmacist'), async (req, res) => {
    const drug = await Drug.findByIdAndUpdate(req.params.id, req.body, { new: true });
    res.send(drug);
});

// Get expiring drugs
router.get('/expiring', auth('pharmacist'), async (req, res) => {
    const today = new Date();
    const nextMonth = new Date(today.setMonth(today.getMonth() + 1));

    const expiringDrugs = await Drug.find({
        expirationDate: { $lte: nextMonth }
    });

    res.send(expiringDrugs);
});

module.exports = router;