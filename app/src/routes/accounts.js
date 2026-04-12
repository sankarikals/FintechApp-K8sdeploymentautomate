'use strict';

const express = require('express');
const { v4: uuidv4 } = require('uuid');
const { accounts } = require('../store/accounts');

const router = express.Router();

// GET /api/v1/accounts – list all accounts
router.get('/', (req, res) => {
  res.json({ accounts: Array.from(accounts.values()) });
});

// POST /api/v1/accounts – create account
router.post('/', (req, res) => {
  const { owner, currency } = req.body;

  if (!owner || typeof owner !== 'string' || owner.trim() === '') {
    return res.status(400).json({ error: 'owner is required' });
  }
  if (!currency || typeof currency !== 'string' || currency.trim() === '') {
    return res.status(400).json({ error: 'currency is required' });
  }

  const account = {
    id: uuidv4(),
    owner: owner.trim(),
    currency: currency.trim().toUpperCase(),
    balance: 0,
    createdAt: new Date().toISOString(),
  };

  accounts.set(account.id, account);
  return res.status(201).json(account);
});

// GET /api/v1/accounts/:id – get account by id
router.get('/:id', (req, res) => {
  const account = accounts.get(req.params.id);
  if (!account) {
    return res.status(404).json({ error: 'Account not found' });
  }
  return res.json(account);
});

// DELETE /api/v1/accounts/:id – delete account
router.delete('/:id', (req, res) => {
  if (!accounts.has(req.params.id)) {
    return res.status(404).json({ error: 'Account not found' });
  }
  accounts.delete(req.params.id);
  return res.status(204).send();
});

module.exports = router;
