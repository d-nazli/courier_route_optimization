const express = require('express');
const router = express.Router();
const db = require('../db/database');

router.post('/', (req, res) => {
  const { username, address, lat, lng } = req.body;
  if (!username || !address || !lat || !lng) {
    return res.status(400).json({ error: 'Eksik alanlar var.' });
  }

  db.run(
    'INSERT INTO orders (username, address, lat, lng, status) VALUES (?, ?, ?, ?, ?)',
    [username, address, lat, lng, 'pending'],
    function (err) {
      if (err) return res.status(500).json({ error: err.message });
      res.status(201).json({ id: this.lastID });
    }
  );
});

router.get('/', (req, res) => {
  db.all('SELECT * FROM orders', (err, rows) => {
    if (err) return res.status(500).json({ error: err.message });
    res.json(rows);
  });
});

router.delete('/:id', (req, res) => {
  db.run('DELETE FROM orders WHERE id = ?', req.params.id, function (err) {
    if (err) return res.status(500).json({ error: err.message });
    res.json({ deleted: this.changes });
  });
});

router.patch('/:id', (req, res) => {
  const { status } = req.body;
  db.run('UPDATE orders SET status = ? WHERE id = ?', [status, req.params.id], function (err) {
    if (err) return res.status(500).json({ error: err.message });
    res.json({ updated: this.changes });
  });
});

router.put('/:id/delivered', (req, res) => {
  const id = req.params.id;
  db.run('UPDATE orders SET status = ? WHERE id = ?', ['delivered', id], function(err) {
    if (err) return res.status(500).json({ error: err.message });
    res.json({ message: 'Teslim edildi olarak işaretlendi' });
  });
});

module.exports = router;
