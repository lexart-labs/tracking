import { beforeEach, describe, expect, it } from 'vitest'
import sessionStore, { SESSION_STORAGE_KEY } from '@/stores/session'

describe('sessionStore', () => {
  beforeEach(() => sessionStore.getState().clearSession())

  it('prefers an iframe session without overwriting the app fallback', () => {
    const appUser = { userId: 1, userRole: 'admin' }
    const iframeUser = { userId: 2, userRole: 'developer' }

    sessionStore.getState().setAppSession(appUser, 'app-token')
    sessionStore.getState().setIframeSession(iframeUser, 'iframe-token')

    expect(sessionStore.getState()).toMatchObject({
      user: iframeUser,
      token: 'iframe-token',
      source: 'iframe',
    })
    expect(JSON.parse(localStorage.getItem(SESSION_STORAGE_KEY))).toEqual({
      user: appUser,
      token: 'app-token',
    })
  })
})
