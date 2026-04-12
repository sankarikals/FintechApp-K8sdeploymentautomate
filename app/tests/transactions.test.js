'use strict';

const request = require('supertest');
const app = require('../src/app');
const { accounts } = require('../src/store/accounts');
const { transactions } = require('../src/store/transactions');

let accountId;

beforeEach(async () => {
  accounts.clear();
  transactions.clear();
  // Create a test account
  const res = await request(app)
    .post('/api/v1/accounts')
    .send({ owner: 'Dave', currency: 'USD' });
  accountId = res.body.id;
});

describe('Transactions API', () => {
  test('GET /api/v1/transactions returns empty list initially', async () => {
    const res = await request(app).get('/api/v1/transactions');
    expect(res.status).toBe(200);
    expect(res.body.transactions).toEqual([]);
  });

  test('POST /api/v1/transactions credits an account', async () => {
    const res = await request(app)
      .post('/api/v1/transactions')
      .send({ accountId, type: 'credit', amount: 500, description: 'Salary' });
    expect(res.status).toBe(201);
    expect(res.body.type).toBe('credit');
    expect(res.body.amount).toBe(500);
    expect(res.body.balanceAfter).toBe(500);
  });

  test('POST /api/v1/transactions debits an account with sufficient funds', async () => {
    // First credit
    await request(app)
      .post('/api/v1/transactions')
      .send({ accountId, type: 'credit', amount: 1000 });

    const res = await request(app)
      .post('/api/v1/transactions')
      .send({ accountId, type: 'debit', amount: 200, description: 'Purchase' });
    expect(res.status).toBe(201);
    expect(res.body.balanceAfter).toBe(800);
  });

  test('POST /api/v1/transactions returns 422 on insufficient funds', async () => {
    const res = await request(app)
      .post('/api/v1/transactions')
      .send({ accountId, type: 'debit', amount: 100 });
    expect(res.status).toBe(422);
    expect(res.body.error).toMatch(/insufficient/i);
  });

  test('POST /api/v1/transactions returns 400 for invalid type', async () => {
    const res = await request(app)
      .post('/api/v1/transactions')
      .send({ accountId, type: 'transfer', amount: 100 });
    expect(res.status).toBe(400);
    expect(res.body.error).toMatch(/type/i);
  });

  test('POST /api/v1/transactions returns 400 for invalid amount', async () => {
    const res = await request(app)
      .post('/api/v1/transactions')
      .send({ accountId, type: 'credit', amount: -50 });
    expect(res.status).toBe(400);
    expect(res.body.error).toMatch(/amount/i);
  });

  test('POST /api/v1/transactions returns 404 for unknown account', async () => {
    const res = await request(app)
      .post('/api/v1/transactions')
      .send({ accountId: 'no-such-id', type: 'credit', amount: 100 });
    expect(res.status).toBe(404);
  });

  test('GET /api/v1/transactions/:id returns transaction', async () => {
    const create = await request(app)
      .post('/api/v1/transactions')
      .send({ accountId, type: 'credit', amount: 100 });
    const { id } = create.body;

    const res = await request(app).get(`/api/v1/transactions/${id}`);
    expect(res.status).toBe(200);
    expect(res.body.id).toBe(id);
  });

  test('GET /api/v1/transactions/:id returns 404 for unknown id', async () => {
    const res = await request(app).get('/api/v1/transactions/no-such-id');
    expect(res.status).toBe(404);
  });
});
