import { describe, it, expect } from 'vitest'
import { http, HttpResponse } from 'msw'
import { server } from '../../mocks/server.js'
import clientService from '@/services/clientService'
import { setSession } from '../helpers/mockSession.js'

const BASE = 'http://localhost:8081'

describe('clientService', () => {
  it('getClients() returns array from response', async () => {
    setSession()
    const result = await clientService.getClients()
    expect(Array.isArray(result)).toBe(true)
    expect(result.length).toBe(2)
    expect(result[0].name).toBe('Acme Corp')
  })

  it('getClients() throws on 500', async () => {
    setSession()
    server.use(
      http.get(`${BASE}/clients/all`, () => new HttpResponse(null, { status: 500 }))
    )
    await expect(clientService.getClients()).rejects.toThrow()
  })

  it('getClient(1) returns single object', async () => {
    setSession()
    const result = await clientService.getClient(1)
    expect(result).toMatchObject({ id: 1, name: 'Acme Corp' })
  })

  it('createClient() strips id field before POST', async () => {
    setSession()
    let capturedBody = null
    server.use(
      http.post(`${BASE}/clients/new`, async ({ request }) => {
        capturedBody = await request.json()
        return HttpResponse.json({ id: 99, ...capturedBody }, { status: 201 })
      })
    )
    await clientService.createClient({ id: 5, name: 'New', company: 'Co' })
    expect(capturedBody).not.toHaveProperty('id')
    expect(capturedBody.name).toBe('New')
  })

  it('toggleActive(1, false) sends {active:false} to update endpoint', async () => {
    setSession()
    let capturedBody = null
    server.use(
      http.put(`${BASE}/clients/update/1`, async ({ request }) => {
        capturedBody = await request.json()
        return HttpResponse.json({ success: true })
      })
    )
    await clientService.toggleActive(1, false)
    expect(capturedBody).toEqual({ active: false })
  })
})
