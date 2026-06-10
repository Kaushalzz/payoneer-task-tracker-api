const express = require('express');
const db = require('../models/db');
const auth = require('../middleware/auth');
const router = express.Router();

router.use(auth);

router.get('/', (req, res) => {
  db.all('SELECT * FROM tasks WHERE username = ?', [req.username], (err, rows) => {
    if (err) {
      return res.status(500).json({ error: err.message });
    }
    res.json(rows);
  });
});

router.post('/', (req, res) => {
  const { title } = req.body;
  
  if (!title) {
    return res.status(400).json({ error: 'Title required' });
  }
  
  db.run('INSERT INTO tasks (title, username) VALUES (?,?)', 
    [title, req.username], 
    function(err) {
      if (err) {
        return res.status(500).json({ error: err.message });
      }
      res.json({ id: this.lastID, title, completed: 0, username: req.username });
    }
  );
});

router.put('/:id', (req, res) => {
  const { completed } = req.body;
  
  db.run('UPDATE tasks SET completed = ? WHERE id = ? AND username = ?', 
    [completed, req.params.id, req.username], 
    function(err) {
      if (err) {
        return res.status(500).json({ error: err.message });
      }
      res.json({ message: 'Task updated' });
    }
  );
});

router.delete('/:id', (req, res) => {
  db.run('DELETE FROM tasks WHERE id = ? AND username = ?', 
    [req.params.id, req.username], 
    function(err) {
      if (err) {
        return res.status(500).json({ error: err.message });
      }
      res.json({ message: 'Deleted' });
    }
  );
});

module.exports = router;