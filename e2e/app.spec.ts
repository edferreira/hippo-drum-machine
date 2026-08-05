import { test, expect } from '@playwright/test';

test.describe('Drum Machine', () => {
  test.beforeEach(async ({ page }) => {
    await page.goto('/');
  });

  test('shows start gate and title', async ({ page }) => {
    await expect(page.locator('.start-button')).toHaveText('Tap to start audio');
    await expect(page).toHaveTitle('Drum Machine');
  });

  test('can start audio and see sequencer', async ({ page }) => {
    await page.click('.start-button');
    await expect(page.locator('.app-container')).toBeVisible();
    await expect(page.locator('.grid')).toBeVisible();
  });

  test('displays controllers after start', async ({ page }) => {
    await page.click('.start-button');
    const stepsInput = page.locator('#steps');
    await expect(stepsInput).toBeVisible();
    await expect(stepsInput).toHaveValue('16');

    const bpmInput = page.locator('#bpm');
    await expect(bpmInput).toBeVisible();
    await expect(bpmInput).toHaveValue('120');
  });

  test('can change BPM', async ({ page }) => {
    await page.click('.start-button');
    await page.fill('#bpm', '140');
    await expect(page.locator('#bpm')).toHaveValue('140');
  });

  test('renders grid cells after start', async ({ page }) => {
    await page.click('.start-button');
    await page.waitForSelector('.grid-cell', { timeout: 5000 });
    const cells = page.locator('.grid-cell');
    const count = await cells.count();
    // 3 instruments x 16 steps = 48 cells
    expect(count).toBeGreaterThanOrEqual(48);
  });

  test('can click a grid cell to toggle it', async ({ page }) => {
    await page.click('.start-button');
    await page.waitForSelector('.grid-cell', { timeout: 5000 });
    const cell = page.locator('.grid-cell').first();

    const wasActive = await cell.evaluate((el) => el.classList.contains('grid-cell--active'));
    await cell.click();
    await expect(cell).toHaveClass(new RegExp(wasActive ? '(?<!active)$' : 'grid-cell--active'));
  });
});
