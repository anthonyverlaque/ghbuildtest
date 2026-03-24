import { test, expect } from '@playwright/test';

test.describe('TaskFlow App', () => {
  test.beforeEach(async ({ page }) => {
    await page.goto('/');
    // Wait for the app to load and API to respond
    await page.waitForSelector('[data-testid="stats-bar"]');
  });

  // ─── Layout & Initial Load ─────────────────────────────────────────────────

  test('displays the app header and logo', async ({ page }) => {
    await expect(page.locator('text=taskflow')).toBeVisible();
    await expect(page.locator('[data-testid="new-task-btn"]')).toBeVisible();
  });

  test('shows API online status after load', async ({ page }) => {
    const status = page.locator('.api-status');
    await expect(status).toBeVisible();
    await expect(status).toContainText('api online', { timeout: 10000 });
  });

  test('shows task stats bar', async ({ page }) => {
    await expect(page.locator('[data-testid="stats-bar"]')).toBeVisible();
    await expect(page.locator('[data-testid="total-count"]')).toBeVisible();
    await expect(page.locator('[data-testid="pending-count"]')).toBeVisible();
  });

  test('shows seeded tasks on initial load', async ({ page }) => {
    const grid = page.locator('[data-testid="task-grid"]');
    await expect(grid).toBeVisible();
    const cards = grid.locator('[data-testid^="task-card-"]');
    await expect(cards).toHaveCount(3); // 3 seeded items
  });

  // ─── Filter Tabs ───────────────────────────────────────────────────────────

  test('filter buttons are visible', async ({ page }) => {
    await expect(page.locator('[data-testid="filter-all"]')).toBeVisible();
    await expect(page.locator('[data-testid="filter-pending"]')).toBeVisible();
    await expect(page.locator('[data-testid="filter-done"]')).toBeVisible();
  });

  test('pending filter shows only incomplete tasks', async ({ page }) => {
    await page.locator('[data-testid="filter-pending"]').click();
    const cards = page.locator('[data-testid^="task-card-"]');
    const count = await cards.count();
    for (let i = 0; i < count; i++) {
      await expect(cards.nth(i)).not.toHaveClass(/completed/);
    }
  });

  test('done filter shows only completed tasks', async ({ page }) => {
    await page.locator('[data-testid="filter-done"]').click();
    const cards = page.locator('[data-testid^="task-card-"]');
    const count = await cards.count();
    for (let i = 0; i < count; i++) {
      await expect(cards.nth(i)).toHaveClass(/completed/);
    }
  });

  // ─── Create Task ───────────────────────────────────────────────────────────

  test('opens create task modal on button click', async ({ page }) => {
    await page.locator('[data-testid="new-task-btn"]').click();
    await expect(page.locator('[data-testid="create-task-modal"]')).toBeVisible();
    await expect(page.locator('[data-testid="task-title-input"]')).toBeVisible();
  });

  test('closes modal when overlay is clicked', async ({ page }) => {
    await page.locator('[data-testid="new-task-btn"]').click();
    await expect(page.locator('[data-testid="create-task-modal"]')).toBeVisible();
    await page.locator('[data-testid="modal-overlay"]').click({ position: { x: 10, y: 10 } });
    await expect(page.locator('[data-testid="create-task-modal"]')).not.toBeVisible();
  });

  test('shows validation error when title is empty', async ({ page }) => {
    await page.locator('[data-testid="new-task-btn"]').click();
    await page.locator('[data-testid="submit-task-btn"]').click();
    await expect(page.locator('text=Title is required')).toBeVisible();
  });

  test('creates a new task successfully', async ({ page }) => {
    const title = `E2E Task ${Date.now()}`;

    await page.locator('[data-testid="new-task-btn"]').click();
    await page.locator('[data-testid="task-title-input"]').fill(title);
    await page.locator('[data-testid="task-description-input"]').fill('Created by Playwright');
    await page.locator('[data-testid="priority-high"]').click();
    await page.locator('[data-testid="submit-task-btn"]').click();

    // Modal should close
    await expect(page.locator('[data-testid="create-task-modal"]')).not.toBeVisible();

    // New task should appear in grid
    await expect(page.locator(`text=${title}`)).toBeVisible();
  });

  test('total count increments after creating a task', async ({ page }) => {
    const countText = await page.locator('[data-testid="total-count"] strong').textContent();
    const before = parseInt(countText ?? '0');

    await page.locator('[data-testid="new-task-btn"]').click();
    await page.locator('[data-testid="task-title-input"]').fill('Count Test Task');
    await page.locator('[data-testid="submit-task-btn"]').click();

    await expect(page.locator('[data-testid="total-count"] strong')).toHaveText(String(before + 1));
  });

  test('priority selection works in modal', async ({ page }) => {
    await page.locator('[data-testid="new-task-btn"]').click();

    for (const priority of ['low', 'medium', 'high']) {
      const btn = page.locator(`[data-testid="priority-${priority}"]`);
      await btn.click();
      await expect(btn).toHaveClass(/selected/);
    }
  });

  // ─── Toggle Completion ─────────────────────────────────────────────────────

  test('toggles a task to completed', async ({ page }) => {
    // Find a pending task's toggle button
    const pendingCard = page.locator('.task-card:not(.completed)').first();
    await expect(pendingCard).toBeVisible();

    const taskId = await pendingCard.getAttribute('data-testid');
    const id = taskId?.replace('task-card-', '');
    const toggleBtn = page.locator(`[data-testid="toggle-${id}"]`);

    await toggleBtn.click();
    await expect(pendingCard).toHaveClass(/completed/);
  });

  test('toggles a completed task back to pending', async ({ page }) => {
    const completedCard = page.locator('.task-card.completed').first();
    await expect(completedCard).toBeVisible();

    const taskId = await completedCard.getAttribute('data-testid');
    const id = taskId?.replace('task-card-', '');
    const toggleBtn = page.locator(`[data-testid="toggle-${id}"]`);

    await toggleBtn.click();
    await expect(completedCard).not.toHaveClass(/completed/);
  });

  // ─── Delete Task ───────────────────────────────────────────────────────────

  test('deletes a task and removes it from the list', async ({ page }) => {
    // Create a fresh task to delete
    const title = `Delete Me ${Date.now()}`;
    await page.locator('[data-testid="new-task-btn"]').click();
    await page.locator('[data-testid="task-title-input"]').fill(title);
    await page.locator('[data-testid="submit-task-btn"]').click();
    await expect(page.locator(`text=${title}`)).toBeVisible();

    // Find the new card and delete it
    const cards = page.locator('[data-testid^="task-card-"]');
    const firstCard = cards.first();
    const taskId = await firstCard.getAttribute('data-testid');
    const id = taskId?.replace('task-card-', '');
    await page.locator(`[data-testid="delete-${id}"]`).click();

    await expect(page.locator(`text=${title}`)).not.toBeVisible();
  });

  test('task count decrements after deletion', async ({ page }) => {
    const countText = await page.locator('[data-testid="total-count"] strong').textContent();
    const before = parseInt(countText ?? '0');

    const firstCard = page.locator('[data-testid^="task-card-"]').first();
    const taskId = await firstCard.getAttribute('data-testid');
    const id = taskId?.replace('task-card-', '');
    await page.locator(`[data-testid="delete-${id}"]`).click();

    await expect(page.locator('[data-testid="total-count"] strong')).toHaveText(String(before - 1));
  });

  // ─── API Integration ───────────────────────────────────────────────────────

  test('data persists after page reload', async ({ page }) => {
    const title = `Persistent Task ${Date.now()}`;

    await page.locator('[data-testid="new-task-btn"]').click();
    await page.locator('[data-testid="task-title-input"]').fill(title);
    await page.locator('[data-testid="submit-task-btn"]').click();
    await expect(page.locator(`text=${title}`)).toBeVisible();

    await page.reload();
    await page.waitForSelector('[data-testid="task-grid"]');
    await expect(page.locator(`text=${title}`)).toBeVisible();
  });

  test('keyboard shortcut Enter submits the modal form', async ({ page }) => {
    const title = `Keyboard Task ${Date.now()}`;
    await page.locator('[data-testid="new-task-btn"]').click();
    await page.locator('[data-testid="task-title-input"]').fill(title);
    await page.keyboard.press('Enter');
    await expect(page.locator('[data-testid="create-task-modal"]')).not.toBeVisible();
    await expect(page.locator(`text=${title}`)).toBeVisible();
  });
});
