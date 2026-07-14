import { describe, it, expect } from 'vitest'
import { render, screen, waitFor } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { MemoryRouter } from 'react-router-dom'
import { PrimeReactProvider } from 'primereact/api'
import { http, HttpResponse } from 'msw'
import { server } from '../../../mocks/server.js'
import { setSession, adminUser, developerUser, clientUser } from '../../helpers/mockSession.js'
import TracksList from '@/application/pages/tracks/list/TracksList'
import { resizerContext } from '@/providers/iframe-resizer'

function renderWithProviders(user = adminUser) {
    return render(
        <resizerContext.Provider value={{ user, token: 'test-token' }}>
            <PrimeReactProvider>
                <MemoryRouter>
                    <TracksList />
                </MemoryRouter>
            </PrimeReactProvider>
        </resizerContext.Provider>
    )
}

describe('TracksList', () => {
    it('renders "Reports" heading', () => {
        setSession(adminUser)
        renderWithProviders(adminUser)
        expect(screen.getByRole('heading', { name: 'Reports' })).toBeInTheDocument()
    })

    it('shows Access Denied for client role', () => {
        setSession(clientUser)
        renderWithProviders(clientUser)
        expect(screen.getByText(/Access Denied/i)).toBeInTheDocument()
    })

    it('admin sees Client, User and Project filter labels', async () => {
        setSession(adminUser)
        renderWithProviders(adminUser)
        await waitFor(() => {
            expect(screen.getByText('Client', { selector: 'label[for="tracks-client"]' })).toBeInTheDocument()
            expect(screen.getByText('User', { selector: 'label[for="tracks-user"]' })).toBeInTheDocument()
            expect(screen.getByText('Project', { selector: 'label[for="tracks-project"]' })).toBeInTheDocument()
        })
    })

    it('developer does not see User filter label', () => {
        setSession(developerUser)
        renderWithProviders(developerUser)
        expect(screen.queryByText('User', { selector: 'label[for="tracks-user"]' })).not.toBeInTheDocument()
        expect(screen.queryByText('Client', { selector: 'label[for="tracks-client"]' })).not.toBeInTheDocument()
        expect(screen.queryByText('Project', { selector: 'label[for="tracks-project"]' })).not.toBeInTheDocument()
    })

    it('Apply button is present', () => {
        setSession(adminUser)
        renderWithProviders(adminUser)
        expect(screen.getByRole('button', { name: /apply/i })).toBeInTheDocument()
    })

    it('shows project group and CSV/PDF buttons after applying filters', async () => {
        setSession(adminUser)
        renderWithProviders(adminUser)

        await userEvent.click(screen.getByRole('button', { name: /apply/i }))

        await waitFor(() => {
            expect(screen.getAllByText('Alpha Project').length).toBeGreaterThan(0)
            expect(screen.getByRole('button', { name: /csv/i })).toBeInTheDocument()
            expect(screen.getByRole('button', { name: /pdf/i })).toBeInTheDocument()
        })
    })

    it('shows track task names after applying filters', async () => {
        setSession(adminUser)
        renderWithProviders(adminUser)

        await userEvent.click(screen.getByRole('button', { name: /apply/i }))

        await waitFor(() => {
            expect(screen.getByText('Implement login')).toBeInTheDocument()
            expect(screen.getByText('Fix bug')).toBeInTheDocument()
        })
    })

    it('shows empty message when no tracks returned', async () => {
        setSession(adminUser)
        server.use(
            http.post('http://localhost:8081/tracks/user/all', () =>
                HttpResponse.json({ response: [] })
            )
        )
        renderWithProviders(adminUser)

        await userEvent.click(screen.getByRole('button', { name: /apply/i }))

        await waitFor(() => {
            expect(
                screen.getByText(/No tracks found for the selected filters/i)
            ).toBeInTheDocument()
        })
    })

    it('shows error message when API call fails', async () => {
        setSession(adminUser)
        server.use(
            http.post('http://localhost:8081/tracks/user/all', () =>
                new HttpResponse(null, { status: 500 })
            )
        )
        renderWithProviders(adminUser)

        await userEvent.click(screen.getByRole('button', { name: /apply/i }))

        await waitFor(() => {
            expect(screen.getByText(/Failed to load tracks/i)).toBeInTheDocument()
        })
    })

    it('developer sees own tracks after applying filters', async () => {
        setSession(developerUser)
        renderWithProviders(developerUser)

        await userEvent.click(screen.getByRole('button', { name: /apply/i }))

        await waitFor(() => {
            expect(screen.getByText('Fix bug')).toBeInTheDocument()
        })
    })
})
