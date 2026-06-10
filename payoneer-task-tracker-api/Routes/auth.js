const express = require('express');
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const db = require('../models/db');
const router = express.Router();

router.post('/register', async (req, res) => {
  const { username, password } = req.body;
  
  if (!username || !password) {
    return res.status(400).json({ error: 'Username and password required' });
  }
  
  const hashed = await bcrypt.hash(password, 10);
  
  db.run('INSERT INTO users (username, password) VALUES (?,?)', 
    [username, hashed], 
    function(err) {
      if (err) return res.status(400).json({ error: 'User exists' });
      res.json({ message: 'User registered' });
    }
  );
});

router.post('/login', (req, res) => {
  const { username, password } = req.body;
  
  db.get('SELECT * FROM users WHERE username = ?', [username], async (err, user) => {
    if (err || !user || !(await bcrypt.compare(password, user.password))) {
      return res.status(401).json({ error: 'Invalid credentials' });
    }
    const token = jwt.sign({ username }, process.env.JWT_SECRET, { expiresIn: '1d' });
    res.json({ token, username });
  });
});

module.exports = router;