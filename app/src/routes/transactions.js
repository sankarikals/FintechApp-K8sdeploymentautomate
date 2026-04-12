'use strict';

const express = require('express');
const { v4: uuidv4 } = require('uuid');
const { accounts } = require('../store/accounts');
const { transactions } = require('../store/transactions');

const router = express.Router();

// GET /api/v1/transactions – list all transactions
router.get('/', (req, res) => {
  res.json({ transactions: Array.from(transactions.values()) });
});

// POST /api/v1/transactions – create a transaction (debit/credit)
router.post('/', (req, res) => {
  const { accountId, type, amount, description } = req.body;

  if (!accountId) {
    return res.status(400).json({ error: 'accountId is required' });
  }
  if (!['credit', 'debit'].includes(type)) {
    return res.status(400).json({ error: 'type must be credit or debit' });
  }
  if (typeof amount !== 'number' || amount <= 0) {
    return res.status(400).json({ error: 'amount must be a positive number' });
  }

  const account = accounts.get(accountId);
  if (!account) {
    return res.status(404).json({ error: 'Account not found' });
  }

  if (type === 'debit' && account.balance < amount) {
    return res.status(422).json({ error: 'Insufficient funds' });
  }

  // Update balance
  if (type === 'credit') {
    account.balance += amount;
  } else {
    account.balance -= amount;
  }
  accounts.set(account.id, account);

  const transaction = {
    id: uuidv4(),
    accountId,
    type,
    amount,
    description: description || '',
    balanceAfter: account.balance,
    createdAt: new Date().toISOString(),
  };

  transactions.set(transaction.id, transaction);
  return res.status(201).json(transaction);
});

// GET /api/v1/transactions/:id – get transaction by id
router.get('/:id', (req, res) => {
  const transaction = transactions.get(req.params.id);
  if (!transaction) {
    return res.status(404).json({ error: 'Transaction not found' });
  }
  return res.json(transaction);
});

module.exports = router;
