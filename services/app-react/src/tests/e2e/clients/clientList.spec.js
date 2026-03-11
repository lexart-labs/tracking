import { test, expect } from '@playwright/test'
import { injectSession, adminUser, developerUser } from '../helpers/session.js'

const BASE = 'http://localhost:8081'

test.beforeEach(async ({ page }) => {
  await page.goto('/#/clients')
})

test('heading and button visible after session inject', async ({ page }) => {
  await injectSession(page, adminUser)
  await expect(page.getByText('Clients')).toBeVisible()
  await expect(page.getByText('+ CLIENT')).toBeVisible()
})

test('client rows load: Acme Corp and Inactive Ltd', async ({ page }) => {
  await injectSession(page, adminUser)
  await expect(page.getByText('Acme Corp')).toBeVisible()
  await expect(page.getByText('Inactive Ltd')).toBeVisible()
})

test('status tags present', async ({ page }) => {
  await injectSession(page, adminUser)
  await expect(page.getByText('Active')).toBeVisible()
  await expect(page.getByText('Inactive')).toBeVisible()
})

test('clicking "+ CLIENT" navigates to /client/NEW route', async ({ page }) => {
  await injectSession(page, adminUser)
  await page.getByText('+ CLIENT').click()
  await expect(page).toHaveURL(/#\/client\/NEW/)
})

test('Access Denied for developer role', async ({ page }) => {
  await injectSession(page, developerUser)
  await expect(page.getByText(/Access Denied/i)).toBeVisible()
})
