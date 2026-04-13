import { describe, it, expect } from 'vitest'
import { http, HttpResponse } from 'msw'
import { server } from '../../mocks/server.js'
import weeklyhoursService from '@/services/weeklyhoursService'
import { setSession } from '../helpers/mockSession.js'

const BASE = 'http://localhost:8081'

describe('weeklyhoursService', () => {
  it('getAll() returns list', async () => {
    setSession()
    const result = await weeklyhoursService.getAll()
    expect(Array.isArray(result)).toBe(true)
    expect(result.length).toBe(2)
    expect(result[0].userName).toBe('Alice')
  })

  it('getAll() throws on 500', async () => {
    setSession()
    server.use(
      http.get(`${BASE}/weeklyhours/all`, () => new HttpResponse(null, { status: 500 }))
    )
    await expect(weeklyhoursService.getAll()).rejects.toThrow()
  })

  it('getById(1) returns record', async () => {
    setSession()
    const result = await weeklyhoursService.getById(1)
    expect(result).toMatchObject({ id: 1, userName: 'Alice' })
  })

  it('create(data) POSTs to /new', async () => {
    setSession()
    let capturedBody = null
    server.use(
      http.post(`${BASE}/weeklyhours/new`, async ({ request }) => {
        capturedBody = await request.json()
        return HttpResponse.json({ ...capturedBody, id: 99 }, { status: 201 })
      })
    )
    const payload = { idUser: 10, userName: 'Alice', costHour: 25, workLoad: 40, currency: 'USD', borrado: 0, valid_from: '2024-01-01', valid_until: null }
    await weeklyhoursService.create(payload)
    expect(capturedBody).toMatchObject({ idUser: 10, userName: 'Alice' })
  })

  it('update(data) PUTs to /update with id in body', async () => {
    setSession()
    let capturedBody = null
    server.use(
      http.put(`${BASE}/weeklyhours/update`, async ({ request }) => {
        capturedBody = await request.json()
        return HttpResponse.json({ success: true })
      })
    )
    await weeklyhoursService.update({ id: 1, userName: 'Alice', costHour: 25 })
    expect(capturedBody).toMatchObject({ id: 1, userName: 'Alice' })
  })

  it('delete(1) sends DELETE', async () => {
    setSession()
    let called = false
    server.use(
      http.delete(`${BASE}/weeklyhours/1`, () => {
        called = true
        return HttpResponse.json({ success: true })
      })
    )
    await weeklyhoursService.delete(1)
    expect(called).toBe(true)
  })

  it('activate(1) sends PUT to /:id/activate', async () => {
    setSession()
    let called = false
    server.use(
      http.put(`${BASE}/weeklyhours/1/activate`, () => {
        called = true
        return HttpResponse.json({ success: true })
      })
    )
    await weeklyhoursService.activate(1)
    expect(called).toBe(true)
  })
})
