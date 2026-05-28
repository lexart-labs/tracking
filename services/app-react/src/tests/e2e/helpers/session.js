/**
 * Injects a session into the React app running inside the page.
 * Simulates what the AngularJS parent does via iFrameResizer.sendMessage().
 */
export async function injectSession(page, user, token = 'test-token') {
  await page.evaluate(
    ({ user, token }) => {
      window.iFrameResizer?.onMessage({ user, token })
    },
    { user, token }
  )
}

export const adminUser = { id: 1, name: 'Admin User', userRole: 'admin' }
export const developerUser = { id: 3, name: 'Dev User', userRole: 'developer' }
export const employeeUser = { id: 4, name: 'Emp User', userRole: 'employee' }
export const clientUser = { id: 5, name: 'Client User', userRole: 'client' }
