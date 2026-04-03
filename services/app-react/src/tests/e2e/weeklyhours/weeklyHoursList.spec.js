import { test, expect } from '@playwright/test'
import { injectSession, adminUser, employeeUser } from '../helpers/session.js'

test.beforeEach(async ({ page }) => {
  await page.goto('/#/weeklyhours')
})

test('heading and button visible after session inject', async ({ page }) => {
  await injectSession(page, adminUser)
  await expect(page.getByText('Weekly Hours')).toBeVisible()
  await expect(page.getByText('+ WEEKLY HOUR')).toBeVisible()
})

test('Alice and Bob rows load, USD 25.00 shown', async ({ page }) => {
  await injectSession(page, adminUser)
  await expect(page.getByText('Alice')).toBeVisible()
  await expect(page.getByText('Bob')).toBeVisible()
  await expect(page.getByText('USD 25.00')).toBeVisible()
})

test('Active and Deleted tags shown', async ({ page }) => {
  await injectSession(page, adminUser)
  await expect(page.getByText('Active')).toBeVisible()
  await expect(page.getByText('Deleted')).toBeVisible()
})

test('+ WEEKLY HOUR navigates to /weeklyhour/NEW', async ({ page }) => {
  await injectSession(page, adminUser)
  await page.getByText('+ WEEKLY HOUR').click()
  await expect(page).toHaveURL(/#\/weeklyhour\/NEW/)
})

test('Access Denied for employee role', async ({ page }) => {
  await injectSession(page, employeeUser)
  await expect(page.getByText(/Access Denied/i)).toBeVisible()
})
