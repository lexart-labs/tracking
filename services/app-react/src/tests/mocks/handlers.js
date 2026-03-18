import { http, HttpResponse } from 'msw'

const BASE_URL = 'http://localhost:8081'

const tracks = [
  {
    id: 1,
    name: 'Implement login',
    idProyecto: 10,
    projectName: 'Alpha Project',
    idUser: 1,
    userName: 'Admin User',
    clientName: 'Acme Corp',
    startTime: '2024-03-01 09:00:00',
    endTime: '2024-03-01 10:00:00',
    duration: '01:00:00',
    costHour: '50.00',
    trackCost: '50.00',
    currency: 'USD',
  },
  {
    id: 2,
    name: 'Fix bug',
    idProyecto: 10,
    projectName: 'Alpha Project',
    idUser: 3,
    userName: 'Dev User',
    clientName: 'Acme Corp',
    startTime: '2024-03-01 11:00:00',
    endTime: '2024-03-01 12:00:00',
    duration: '01:00:00',
    costHour: '30.00',
    trackCost: '30.00',
    currency: 'USD',
  },
]

const projects = [
  { id: 10, name: 'Alpha Project' },
  { id: 11, name: 'Beta Project' },
]

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

  // Projects
  http.get(`${BASE_URL}/projects/all`, () => {
    return HttpResponse.json({ response: projects })
  }),

  // Tracks
  http.post(`${BASE_URL}/tracks/user/all`, () => {
    return HttpResponse.json({ response: tracks })
  }),

  http.post(`${BASE_URL}/tracks/user/current`, () => {
    return HttpResponse.json({ response: [tracks[1]] })
  }),

  http.post(`${BASE_URL}/tracks/user/:id`, ({ params }) => {
    const filtered = tracks.filter((t) => t.idUser === Number(params.id))
    return HttpResponse.json({ response: filtered })
  }),

  http.put(`${BASE_URL}/tracks/update`, () => {
    return HttpResponse.json({ response: {} })
  }),

  http.put(`${BASE_URL}/tracks/user/current/update`, () => {
    return HttpResponse.json({ response: {} })
  }),

  http.post(`${BASE_URL}/tracks/export/csv`, () => {
    return new HttpResponse('"Project","Client","Task"\n"Alpha Project","Acme Corp","Fix bug"', {
      headers: { 'Content-Type': 'text/csv; charset=utf-8' },
    })
  }),
]
