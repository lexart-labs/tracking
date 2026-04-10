import { describe, it, expect } from 'vitest'
import { http, HttpResponse } from 'msw'
import { server } from '../../mocks/server.js'
import { setSession, adminUser, developerUser } from '../helpers/mockSession.js'
import tracksService from '@/services/tracksService'

const BASE = 'http://localhost:8081'
const DATE_PARAMS = { startTime: '2024-03-01 00:00:00', endTime: '2024-03-31 23:59:59' }

describe('tracksService.getTracks', () => {
    it('calls /tracks/user/all for admin without idUser', async () => {
        setSession(adminUser)
        const result = await tracksService.getTracks(DATE_PARAMS, 'admin')
        expect(Array.isArray(result)).toBe(true)
        expect(result.length).toBeGreaterThan(0)
        expect(result[0].projectName).toBe('Alpha Project')
    })

    it('calls /tracks/user/:id for admin with idUser', async () => {
        setSession(adminUser)
        let calledUrl = ''
        server.use(
            http.post(`${BASE}/tracks/user/:id`, ({ params, request }) => {
                calledUrl = `/tracks/user/${params.id}`
                return HttpResponse.json({ response: [] })
            })
        )
        await tracksService.getTracks({ ...DATE_PARAMS, idUser: 3 }, 'admin')
        expect(calledUrl).toBe('/tracks/user/3')
    })

    it('calls /tracks/user/current for developer', async () => {
        setSession(developerUser)
        let called = false
        server.use(
            http.post(`${BASE}/tracks/user/current`, () => {
                called = true
                return HttpResponse.json({ response: [] })
            })
        )
        await tracksService.getTracks(DATE_PARAMS, 'developer')
        expect(called).toBe(true)
    })

    it('sends idClient and idProject in body when provided', async () => {
        setSession(adminUser)
        let body = null
        server.use(
            http.post(`${BASE}/tracks/user/all`, async ({ request }) => {
                body = await request.json()
                return HttpResponse.json({ response: [] })
            })
        )
        await tracksService.getTracks({ ...DATE_PARAMS, idClient: 5, idProject: 7 }, 'admin')
        expect(body.idClient).toBe(5)
        expect(body.idProject).toBe(7)
    })
})

describe('tracksService.exportCsv', () => {
    it('calls /tracks/export/csv and returns a Blob', async () => {
        setSession(adminUser)
        const blob = await tracksService.exportCsv(DATE_PARAMS)
        expect(blob).toBeInstanceOf(Blob)
    })

    it('sends date params in the request body', async () => {
        setSession(adminUser)
        let body = null
        server.use(
            http.post(`${BASE}/tracks/export/csv`, async ({ request }) => {
                body = await request.json()
                return new HttpResponse('csv', { headers: { 'Content-Type': 'text/csv' } })
            })
        )
        await tracksService.exportCsv(DATE_PARAMS)
        expect(body.startTime).toBe(DATE_PARAMS.startTime)
        expect(body.endTime).toBe(DATE_PARAMS.endTime)
    })
})
