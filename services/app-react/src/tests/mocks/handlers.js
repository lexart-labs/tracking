import { http, HttpResponse } from 'msw'

const BASE_URL = 'http://localhost:8081'

const clients = [
  { id: 1, name: 'Acme Corp', company: 'Acme', active: true },
  { id: 2, name: 'Inactive Ltd', company: 'Inactive Co', active: false },
]

const weeklyHours = [
  { id: 1, idUser: 10, userName: 'Alice', costHour: '25.00', workLoad: '40', currency: 'USD', borrado: '0', valid_from: '2024-01-01', valid_until: null },
  { id: 2, idUser: 11, userName: 'Bob', costHour: '30.00', workLoad: '20', currency: 'USD', borrado: '1', valid_from: '2024-01-01', valid_until: null },
]

const users = [
  { id: 10, name: 'Alice' },
  { id: 11, name: 'Bob' },
]

export const handlers = [
  // Clients
  http.get(`${BASE_URL}/clients/all`, () => {
    return HttpResponse.json({ response: clients })
  }),

  http.get(`${BASE_URL}/clients/:id`, ({ params }) => {
    const client = clients.find((c) => c.id === Number(params.id))
    if (!client) return new HttpResponse(null, { status: 404 })
    return HttpResponse.json({ response: client })
  }),

  http.post(`${BASE_URL}/clients/new`, async ({ request }) => {
    const body = await request.json()
    return HttpResponse.json({ ...body, id: 99 }, { status: 201 })
  }),

  http.put(`${BASE_URL}/clients/update/:id`, () => {
    return HttpResponse.json({ success: true })
  }),

  // Weekly Hours
  http.get(`${BASE_URL}/weeklyhours/all`, () => {
    return HttpResponse.json({ response: weeklyHours })
  }),

  http.get(`${BASE_URL}/weeklyhours/:id`, ({ params }) => {
    const record = weeklyHours.find((r) => r.id === Number(params.id))
    if (!record) return new HttpResponse(null, { status: 404 })
    return HttpResponse.json({ response: record })
  }),

  http.post(`${BASE_URL}/weeklyhours/new`, async ({ request }) => {
    const body = await request.json()
    return HttpResponse.json({ ...body, id: 99 }, { status: 201 })
  }),

  http.put(`${BASE_URL}/weeklyhours/update`, async ({ request }) => {
    return HttpResponse.json({ success: true })
  }),

  http.delete(`${BASE_URL}/weeklyhours/:id`, () => {
    return HttpResponse.json({ success: true })
  }),

  http.put(`${BASE_URL}/weeklyhours/:id/activate`, () => {
    return HttpResponse.json({ success: true })
  }),

  // Users
  http.get(`${BASE_URL}/user/all`, () => {
    return HttpResponse.json({ response: users })
  }),
]
