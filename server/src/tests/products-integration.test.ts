import { describe, it, expect, beforeAll } from 'vitest';
import request from 'supertest';
import { App } from '../app.js';

const app = App();
const ADMIN_EMAIL = 'admin@lockincoffee.local';
const ADMIN_PASSWORD = 'ChangeMe123!';

let adminToken: string;
let cashierToken: string;
let categoryId: string;

beforeAll(async () => {
  const adminLogin = await request(app)
    .post('/api/v1/auth/login')
    .send({ email: ADMIN_EMAIL, password: ADMIN_PASSWORD });
  adminToken = adminLogin.body.data.accessToken;

  const cashierEmail = `prod-cashier-${Date.now()}@shop.com`;
  await request(app)
    .post('/api/v1/users')
    .set('Authorization', `Bearer ${adminToken}`)
    .send({ fullName: 'Cashier', email: cashierEmail, password: 'Password123', role: 'cashier' });
  const cashierLogin = await request(app)
    .post('/api/v1/auth/login')
    .send({ email: cashierEmail, password: 'Password123' });
  cashierToken = cashierLogin.body.data.accessToken;

  const categoryRes = await request(app)
    .post('/api/v1/categories')
    .set('Authorization', `Bearer ${adminToken}`)
    .send({ name: `Products-Test-Category-${Date.now()}` });
  categoryId = categoryRes.body.data.id;
});

describe('POST /api/v1/products', () => {
  it('returns 404 when categoryId does not reference a real category', async () => {
    const res = await request(app)
      .post('/api/v1/products')
      .set('Authorization', `Bearer ${adminToken}`)
      .send({
        categoryId: '00000000-0000-0000-0000-000000000000',
        name: 'Ghost Latte',
        basePrice: 450,
      });

    expect(res.status).toBe(404);
  });

  it('is forbidden for a Cashier', async () => {
    const res = await request(app)
      .post('/api/v1/products')
      .set('Authorization', `Bearer ${cashierToken}`)
      .send({ categoryId, name: 'Cashier Attempt', basePrice: 450 });

    expect(res.status).toBe(403);
  });

  it('creates a product under a real category', async () => {
    const res = await request(app)
      .post('/api/v1/products')
      .set('Authorization', `Bearer ${adminToken}`)
      .send({ categoryId, name: `Latte-${Date.now()}`, basePrice: 450 });

    expect(res.status).toBe(201);
    expect(res.body.data.basePriceCents).toBe(450);
  });

  it('rejects a duplicate name within the same category', async () => {
    const name = `Cappuccino-${Date.now()}`;
    await request(app)
      .post('/api/v1/products')
      .set('Authorization', `Bearer ${adminToken}`)
      .send({ categoryId, name, basePrice: 400 });

    const res = await request(app)
      .post('/api/v1/products')
      .set('Authorization', `Bearer ${adminToken}`)
      .send({ categoryId, name, basePrice: 400 });

    expect(res.status).toBe(409);
  });

  it('allows the same name in a DIFFERENT category', async () => {
    const otherCategoryRes = await request(app)
      .post('/api/v1/categories')
      .set('Authorization', `Bearer ${adminToken}`)
      .send({ name: `Other-Category-${Date.now()}` });
    const otherCategoryId = otherCategoryRes.body.data.id;

    const name = `Shared-Name-${Date.now()}`;
    await request(app)
      .post('/api/v1/products')
      .set('Authorization', `Bearer ${adminToken}`)
      .send({ categoryId, name, basePrice: 400 });

    const res = await request(app)
      .post('/api/v1/products')
      .set('Authorization', `Bearer ${adminToken}`)
      .send({ categoryId: otherCategoryId, name, basePrice: 400 });

    expect(res.status).toBe(201);
  });
});

describe('GET /api/v1/products', () => {
  it('filters by categoryId when provided', async () => {
    const res = await request(app)
      .get(`/api/v1/products?categoryId=${categoryId}`)
      .set('Authorization', `Bearer ${cashierToken}`);

    expect(res.status).toBe(200);
    expect(res.body.data.every((p: { categoryId: string }) => p.categoryId === categoryId)).toBe(
      true,
    );
  });
});