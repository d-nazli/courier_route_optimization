const express = require('express');
const router = express.Router();
const db = require('../db/database');
const { runPSO } = require('../algorithms/pso');

router.get('/', (req, res) => {
  db.all('SELECT * FROM orders WHERE status = "pending"', (err, orders) => {
    if (err) return res.status(500).json({ error: err.message });


    const depot = { lat: 41.015137, lng: 28.979530 };

    const optimized = runPSO(orders, depot);
    res.json(optimized);
  });
});

module.exports = router;
