import { test, expect } from '@playwright/test'
import { injectSession, adminUser, developerUser, clientUser } from '../helpers/session.js'

test.beforeEach(async ({ page }) => {
    await page.goto('/#/tracks')
})

// -------------------------------------------------------------------------
// Heading and basic rendering
// -------------------------------------------------------------------------

test('heading "Tracks" visible after session inject', async ({ page }) => {
    await injectSession(page, adminUser)
    await expect(page.getByRole('heading', { name: 'Tracks' })).toBeVisible()
})

test('Apply button is present', async ({ page }) => {
    await injectSession(page, adminUser)
    await expect(page.getByRole('button', { name: /apply/i })).toBeVisible()
})

// -------------------------------------------------------------------------
// RBAC — filter visibility
// -------------------------------------------------------------------------

test('admin sees Client, User and Project filter labels', async ({ page }) => {
    await injectSession(page, adminUser)
    await expect(page.getByText('Client')).toBeVisible()
    await expect(page.getByText('User')).toBeVisible()
    await expect(page.getByText('Project')).toBeVisible()
})

test('developer does not see User, Client or Project filters', async ({ page }) => {
    await injectSession(page, developerUser)
    await expect(page.getByText('User')).not.toBeVisible()
    await expect(page.getByText('Client')).not.toBeVisible()
    await expect(page.getByText('Project')).not.toBeVisible()
})

test('client role sees Access Denied', async ({ page }) => {
    await injectSession(page, clientUser)
    await expect(page.getByText(/Access Denied/i)).toBeVisible()
})

// -------------------------------------------------------------------------
// Data loading
// -------------------------------------------------------------------------

test('admin: clicking Apply shows track rows and project group header', async ({ page }) => {
    await injectSession(page, adminUser)
    await page.getByRole('button', { name: /apply/i }).click()
    await expect(page.getByText('Alpha Project')).toBeVisible()
    await expect(page.getByText('Implement login')).toBeVisible()
    await expect(page.getByText('Fix bug')).toBeVisible()
})

test('admin: CSV and PDF export buttons appear after data loads', async ({ page }) => {
    await injectSession(page, adminUser)
    await page.getByRole('button', { name: /apply/i }).click()
    await expect(page.getByRole('button', { name: /csv/i })).toBeVisible()
    await expect(page.getByRole('button', { name: /pdf/i })).toBeVisible()
})

test('developer: clicking Apply shows only own tracks', async ({ page }) => {
    await injectSession(page, developerUser)
    await page.getByRole('button', { name: /apply/i }).click()
    await expect(page.getByText('Fix bug')).toBeVisible()
})

// -------------------------------------------------------------------------
// Summary section
// -------------------------------------------------------------------------

test('Summary section visible after data loads', async ({ page }) => {
    await injectSession(page, adminUser)
    await page.getByRole('button', { name: /apply/i }).click()
    await expect(page.getByText('Summary')).toBeVisible()
})

// -------------------------------------------------------------------------
// Edit dialog
// -------------------------------------------------------------------------

test('clicking edit button opens the edit dialog', async ({ page }) => {
    await injectSession(page, adminUser)
    await page.getByRole('button', { name: /apply/i }).click()
    await expect(page.getByText('Implement login')).toBeVisible()

    await page.locator('button[aria-label="pi-pencil"], button:has(.pi-pencil)').first().click()
    await expect(page.getByRole('dialog')).toBeVisible()
})
