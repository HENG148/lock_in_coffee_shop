import { describe, it, expect, beforeAll } from 'vitest';
import request from 'supertest';
import { App } from '../app.js';

const app = App();
const ADMIN_EMAIL = 'admin@lockincoffee.local';
const ADMIN_PASSWORD = 'ChangeMe123!';

let adminToken: string;
let cashierToken: string;
let categoryId: string;
let productId: string;

beforeAll(async () => {
  const adminLogin = await request(app)
    .post('/api/v1/auth/login')
    .send({ email: ADMIN_EMAIL, password: ADMIN_PASSWORD });
  adminToken = adminLogin.body.data.accessToken;

  const cashierEmail = `variants-cashier-${Date.now()}@shop.com`;
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
    .send({ name: `Variant-Test-Category-${Date.now()}` });
  categoryId = categoryRes.body.data.id;

  const productRes = await request(app)
    .post('/api/v1/products')
    .set('Authorization', `Bearer ${adminToken}`)
    .send({ categoryId, name: `Variant-Test-Latte-${Date.now()}`, basePrice: 450 });
  productId = productRes.body.data.id;
});

describe('Variant groups and options', () => {
  it('creates a group, then an option under it with a price modifier', async () => {
    const groupRes = await request(app)
      .post('/api/v1/variant-groups')
      .set('Authorization', `Bearer ${adminToken}`)
      .send({ name: `Size-${Date.now()}`, isRequired: true });

    expect(groupRes.status).toBe(201);
    const groupId = groupRes.body.data.id;

    const optionRes = await request(app)
      .post(`/api/v1/variant-groups/${groupId}/options`)
      .set('Authorization', `Bearer ${adminToken}`)
      .send({ name: 'Large', priceModifier: 50 });

    expect(optionRes.status).toBe(201);
    expect(optionRes.body.data.priceModifierCents).toBe(50);
  });

  it('is forbidden for a Cashier', async () => {
    const res = await request(app)
      .post('/api/v1/variant-groups')
      .set('Authorization', `Bearer ${cashierToken}`)
      .send({ name: `Cashier-Attempt-${Date.now()}` });

    expect(res.status).toBe(403);
  });

  it('rejects a negative price modifier', async () => {
    const groupRes = await request(app)
      .post('/api/v1/variant-groups')
      .set('Authorization', `Bearer ${adminToken}`)
      .send({ name: `Negative-Test-${Date.now()}` });
    const groupId = groupRes.body.data.id;

    const res = await request(app)
      .post(`/api/v1/variant-groups/${groupId}/options`)
      .set('Authorization', `Bearer ${adminToken}`)
      .send({ name: 'Weird', priceModifier: -50 });

    expect(res.status).toBe(400);
  });
});

describe('Product <-> variant group attach/detach', () => {
  it('attaches a group to a product, lists it, then detaches it', async () => {
    const groupRes = await request(app)
      .post('/api/v1/variant-groups')
      .set('Authorization', `Bearer ${adminToken}`)
      .send({ name: `Attach-Test-${Date.now()}` });
    const groupId = groupRes.body.data.id;

    const attachRes = await request(app)
      .post(`/api/v1/products/${productId}/variant-groups`)
      .set('Authorization', `Bearer ${adminToken}`)
      .send({ variantGroupId: groupId });
    expect(attachRes.status).toBe(201);

    const listRes = await request(app)
      .get(`/api/v1/products/${productId}/variant-groups`)
      .set('Authorization', `Bearer ${cashierToken}`);
    expect(listRes.status).toBe(200);
    expect(listRes.body.data.some((l: { variantGroupId: string }) => l.variantGroupId === groupId)).toBe(
      true,
    );

    const detachRes = await request(app)
      .delete(`/api/v1/products/${productId}/variant-groups/${groupId}`)
      .set('Authorization', `Bearer ${adminToken}`);
    expect(detachRes.status).toBe(204);

    const listAfterRes = await request(app)
      .get(`/api/v1/products/${productId}/variant-groups`)
      .set('Authorization', `Bearer ${cashierToken}`);
    expect(
      listAfterRes.body.data.some((l: { variantGroupId: string }) => l.variantGroupId === groupId),
    ).toBe(false);
  });

  it('rejects attaching the same group to the same product twice', async () => {
    const groupRes = await request(app)
      .post('/api/v1/variant-groups')
      .set('Authorization', `Bearer ${adminToken}`)
      .send({ name: `Dup-Attach-Test-${Date.now()}` });
    const groupId = groupRes.body.data.id;

    await request(app)
      .post(`/api/v1/products/${productId}/variant-groups`)
      .set('Authorization', `Bearer ${adminToken}`)
      .send({ variantGroupId: groupId });

    const res = await request(app)
      .post(`/api/v1/products/${productId}/variant-groups`)
      .set('Authorization', `Bearer ${adminToken}`)
      .send({ variantGroupId: groupId });

    expect(res.status).toBe(409);
  });
});