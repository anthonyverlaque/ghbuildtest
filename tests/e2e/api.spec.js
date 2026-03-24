import { test, expect } from '@playwright/test';

const API = 'http://localhost:5000/api';

test.describe('Tasks API — smoke tests', () => {
  let createdId;

  test('GET /health returns 200', async ({ request }) => {
    const res = await request.get('http://localhost:5000/health');
    expect(res.status()).toBe(200);
    const body = await res.json();
    expect(body.status).toBe('healthy');
  });

  test('GET /api/tasks returns array', async ({ request }) => {
    const res = await request.get(`${API}/tasks`);
    expect(res.status()).toBe(200);
    const body = await res.json();
    expect(Array.isArray(body)).toBe(true);
  });

  test('POST /api/tasks creates a task', async ({ request }) => {
    const res = await request.post(`${API}/tasks`, {
      data: { title: 'API Test Task', description: 'from Playwright', priority: 1 }
    });
    expect(res.status()).toBe(201);
    const body = await res.json();
    expect(body.id).toBeTruthy();
    expect(body.title).toBe('API Test Task');
    expect(body.isCompleted).toBe(false);
    createdId = body.id;
  });

  test('POST /api/tasks returns 400 when title is missing', async ({ request }) => {
    const res = await request.post(`${API}/tasks`, {
      data: { description: 'no title here' }
    });
    expect(res.status()).toBe(400);
  });

  test('GET /api/tasks/:id returns created task', async ({ request }) => {
    // create first
    const create = await request.post(`${API}/tasks`, {
      data: { title: 'GetById Test', priority: 0 }
    });
    const { id } = await create.json();

    const res = await request.get(`${API}/tasks/${id}`);
    expect(res.status()).toBe(200);
    const body = await res.json();
    expect(body.id).toBe(id);
    expect(body.title).toBe('GetById Test');
  });

  test('GET /api/tasks/:id returns 404 for unknown id', async ({ request }) => {
    const fakeId = '00000000-0000-0000-0000-000000000000';
    const res = await request.get(`${API}/tasks/${fakeId}`);
    expect(res.status()).toBe(404);
  });

  test('PUT /api/tasks/:id updates a task', async ({ request }) => {
    const create = await request.post(`${API}/tasks`, {
      data: { title: 'Before Update', priority: 0 }
    });
    const { id } = await create.json();

    const res = await request.put(`${API}/tasks/${id}`, {
      data: { title: 'After Update', isCompleted: true }
    });
    expect(res.status()).toBe(200);
    const body = await res.json();
    expect(body.title).toBe('After Update');
    expect(body.isCompleted).toBe(true);
  });

  test('PUT /api/tasks/:id returns 404 for unknown id', async ({ request }) => {
    const fakeId = '00000000-0000-0000-0000-000000000000';
    const res = await request.put(`${API}/tasks/${fakeId}`, {
      data: { title: 'Nope' }
    });
    expect(res.status()).toBe(404);
  });

  test('DELETE /api/tasks/:id removes a task', async ({ request }) => {
    const create = await request.post(`${API}/tasks`, {
      data: { title: 'To Be Deleted', priority: 1 }
    });
    const { id } = await create.json();

    const del = await request.delete(`${API}/tasks/${id}`);
    expect(del.status()).toBe(204);

    // confirm it's gone
    const get = await request.get(`${API}/tasks/${id}`);
    expect(get.status()).toBe(404);
  });

  test('DELETE /api/tasks/:id returns 404 for unknown id', async ({ request }) => {
    const fakeId = '00000000-0000-0000-0000-000000000000';
    const res = await request.delete(`${API}/tasks/${fakeId}`);
    expect(res.status()).toBe(404);
  });

  test('GET /api/tasks returns seeded tasks on startup', async ({ request }) => {
    const res = await request.get(`${API}/tasks`);
    const body = await res.json();
    expect(body.length).toBeGreaterThanOrEqual(3);
  });
});
