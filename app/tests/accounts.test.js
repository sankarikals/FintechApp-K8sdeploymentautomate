'use strict';

const request = require('supertest');
const app = require('../src/app');
const { accounts } = require('../src/store/accounts');

beforeEach(() => {
  accounts.clear();
});

describe('Accounts API', () => {
  test('GET /api/v1/accounts returns empty list initially', async () => {
    const res = await request(app).get('/api/v1/accounts');
    expect(res.status).toBe(200);
    expect(res.body.accounts).toEqual([]);
  });

  test('POST /api/v1/accounts creates an account', async () => {
    const res = await request(app)
      .post('/api/v1/accounts')
      .send({ owner: 'Alice', currency: 'USD' });
    expect(res.status).toBe(201);
    expect(res.body.id).toBeDefined();
    expect(res.body.owner).toBe('Alice');
    expect(res.body.currency).toBe('USD');
    expect(res.body.balance).toBe(0);
  });

  test('POST /api/v1/accounts returns 400 when owner missing', async () => {
    const res = await request(app)
      .post('/api/v1/accounts')
      .send({ currency: 'USD' });
    expect(res.status).toBe(400);
    expect(res.body.error).toMatch(/owner/i);
  });

  test('POST /api/v1/accounts returns 400 when currency missing', async () => {
    const res = await request(app)
      .post('/api/v1/accounts')
      .send({ owner: 'Alice' });
    expect(res.status).toBe(400);
    expect(res.body.error).toMatch(/currency/i);
  });

  test('GET /api/v1/accounts/:id returns account', async () => {
    const create = await request(app)
      .post('/api/v1/accounts')
      .send({ owner: 'Bob', currency: 'EUR' });
    const { id } = create.body;

    const res = await request(app).get(`/api/v1/accounts/${id}`);
    expect(res.status).toBe(200);
    expect(res.body.id).toBe(id);
  });

  test('GET /api/v1/accounts/:id returns 404 for unknown id', async () => {
    const res = await request(app).get('/api/v1/accounts/non-existent-id');
    expect(res.status).toBe(404);
  });

  test('DELETE /api/v1/accounts/:id removes account', async () => {
    const create = await request(app)
      .post('/api/v1/accounts')
      .send({ owner: 'Charlie', currency: 'GBP' });
    const { id } = create.body;

    const del = await request(app).delete(`/api/v1/accounts/${id}`);
    expect(del.status).toBe(204);

    const get = await request(app).get(`/api/v1/accounts/${id}`);
    expect(get.status).toBe(404);
  });
});
