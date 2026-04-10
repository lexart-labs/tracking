import { describe, it, expect } from 'vitest'
import { render, screen, waitFor } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { MemoryRouter } from 'react-router-dom'
import { PrimeReactProvider } from 'primereact/api'
import { http, HttpResponse } from 'msw'
import { server } from '../../../mocks/server.js'
import { setSession, adminUser, developerUser, clientUser } from '../../helpers/mockSession.js'
import TracksList from '@/application/pages/tracks/list/TracksList'

function renderWithProviders() {
    return render(
        <PrimeReactProvider>
            <MemoryRouter>
                <TracksList />
            </MemoryRouter>
        </PrimeReactProvider>
    )
}

describe('TracksList', () => {
    it('renders "Tracks" heading', () => {
        setSession(adminUser)
        renderWithProviders()
        expect(screen.getByText('Tracks')).toBeInTheDocument()
    })

    it('shows Access Denied for client role', () => {
        setSession(clientUser)
        renderWithProviders()
        expect(screen.getByText(/Access Denied/i)).toBeInTheDocument()
    })

    it('admin sees Client, User and Project filter labels', async () => {
        setSession(adminUser)
        renderWithProviders()
        await waitFor(() => {
            expect(screen.getByText('Client')).toBeInTheDocument()
            expect(screen.getByText('User')).toBeInTheDocument()
            expect(screen.getByText('Project')).toBeInTheDocument()
        })
    })

    it('developer does not see User filter label', () => {
        setSession(developerUser)
        renderWithProviders()
        expect(screen.queryByText('User')).not.toBeInTheDocument()
        expect(screen.queryByText('Client')).not.toBeInTheDocument()
        expect(screen.queryByText('Project')).not.toBeInTheDocument()
    })

    it('Apply button is present', () => {
        setSession(adminUser)
        renderWithProviders()
        expect(screen.getByRole('button', { name: /apply/i })).toBeInTheDocument()
    })

    it('shows project group and CSV/PDF buttons after applying filters', async () => {
        setSession(adminUser)
        renderWithProviders()

        await userEvent.click(screen.getByRole('button', { name: /apply/i }))

        await waitFor(() => {
            expect(screen.getByText('Alpha Project')).toBeInTheDocument()
            expect(screen.getByRole('button', { name: /csv/i })).toBeInTheDocument()
            expect(screen.getByRole('button', { name: /pdf/i })).toBeInTheDocument()
        })
    })

    it('shows track task names after applying filters', async () => {
        setSession(adminUser)
        renderWithProviders()

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
        renderWithProviders()

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
        renderWithProviders()

        await userEvent.click(screen.getByRole('button', { name: /apply/i }))

        await waitFor(() => {
            expect(screen.getByText(/Failed to load tracks/i)).toBeInTheDocument()
        })
    })

    it('developer sees own tracks after applying filters', async () => {
        setSession(developerUser)
        renderWithProviders()

        await userEvent.click(screen.getByRole('button', { name: /apply/i }))

        await waitFor(() => {
            expect(screen.getByText('Fix bug')).toBeInTheDocument()
        })
    })
})
