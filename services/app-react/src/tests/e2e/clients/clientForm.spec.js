import { test, expect } from '@playwright/test'
import { injectSession, adminUser } from '../helpers/session.js'

test.beforeEach(async ({ page }) => {
  await page.goto('/#/client/NEW')
  await injectSession(page, adminUser)
})

test('create: heading and Save button visible', async ({ page }) => {
  await expect(page.getByText('New Client')).toBeVisible()
  await expect(page.getByRole('button', { name: /Save/i })).toBeVisible()
})

test('create: validation error on empty submit', async ({ page }) => {
  await page.getByRole('button', { name: /Save/i }).click()
  await expect(page.getByText(/Name and Company are required/i)).toBeVisible()
})

test('create: fill and submit navigates away from /client/NEW', async ({ page }) => {
  await page.getByLabel('Name').fill('Test Client')
  await page.getByLabel('Company').fill('Test Co')
  await page.getByRole('button', { name: /Save/i }).click()
  await expect(page).not.toHaveURL(/#\/client\/NEW/)
})

test('edit: pre-filled Name and Company fields', async ({ page }) => {
  await page.goto('/#/client/1')
  await injectSession(page, adminUser)
  await expect(page.getByDisplayValue('Acme Corp')).toBeVisible()
  await expect(page.getByDisplayValue('Acme')).toBeVisible()
})

test('edit: Update button visible', async ({ page }) => {
  await page.goto('/#/client/1')
  await injectSession(page, adminUser)
  await expect(page.getByRole('button', { name: /Update/i })).toBeVisible()
})

test('edit: toggle active switch and submit navigates away', async ({ page }) => {
  await page.goto('/#/client/1')
  await injectSession(page, adminUser)
  await page.getByRole('checkbox').click()
  await page.getByRole('button', { name: /Update/i }).click()
  await expect(page).not.toHaveURL(/#\/client\/1/)
})
