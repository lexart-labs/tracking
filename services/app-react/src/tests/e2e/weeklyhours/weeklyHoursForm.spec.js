import { test, expect } from '@playwright/test'
import { injectSession, adminUser } from '../helpers/session.js'

test.beforeEach(async ({ page }) => {
  await page.goto('/#/weeklyhour/NEW')
  await injectSession(page, adminUser)
})

test('create: heading and Save button visible', async ({ page }) => {
  await expect(page.getByText('New Weekly Hour')).toBeVisible()
  await expect(page.getByRole('button', { name: /Save/i })).toBeVisible()
})

test('create: validation error on empty submit', async ({ page }) => {
  await page.getByRole('button', { name: /Save/i }).click()
  await expect(page.getByText(/User, Cost\/Hour, Workload, Currency and Valid From are required/i)).toBeVisible()
})

test('create: user Dropdown shows Alice and Bob options', async ({ page }) => {
  // Open the user Dropdown
  await page.getByLabel('User').click()
  await expect(page.getByText('Alice')).toBeVisible()
  await expect(page.getByText('Bob')).toBeVisible()
})

test('edit: userName pre-filled with Alice', async ({ page }) => {
  await page.goto('/#/weeklyhour/1')
  await injectSession(page, adminUser)
  await expect(page.getByDisplayValue('Alice')).toBeVisible()
})

test('edit: submit navigates away from /weeklyhour/1', async ({ page }) => {
  await page.goto('/#/weeklyhour/1')
  await injectSession(page, adminUser)
  await page.getByRole('button', { name: /Update/i }).click()
  await expect(page).not.toHaveURL(/#\/weeklyhour\/1/)
})
