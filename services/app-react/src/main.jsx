// APP VERSION: 2.1.0-ALIGNED-FIX
import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import { HashRouter as Router, Route, Routes } from "react-router-dom";
import { Dashboard } from './application/dashboard'
import { User } from '@/application/pages/user/form/User'
import { UserList } from '@/application/pages/user/list/UserList'
import ClientList from '@/application/pages/clients/list/ClientList'
import ClientForm from '@/application/pages/clients/form/ClientForm'
import PaymentRequestsAdmin from '@/application/pages/paymentRequestsAdmin/PaymentRequestsAdmin'
import PaymentRequests from '@/application/pages/paymentRequests/PaymentRequests'
import WeeklyHoursList from '@/application/pages/weeklyhours/list/WeeklyHoursList'
import WeeklyHoursForm from '@/application/pages/weeklyhours/form/WeeklyHoursForm'
import TracksList from '@/application/pages/tracks/list/TracksList'
import ProtectedRoute from '@/application/components/ProtectedRoute'
import ResizerProvider from '@/providers/iframe-resizer'
import { PrimeReactProvider } from 'primereact/api'
import Layout from '@/application/Layout'
import '@iframe-resizer/child'
import './index.css'
import ChatBotWidget from '@/application/pages/chatbot/ChatBotWidget.tsx'

async function enableMocking() {
	if (import.meta.env.VITE_MSW_ENABLED !== 'true') return
	const { worker } = await import('./tests/e2e/mocks/browser.js')
	return worker.start({ onUnhandledRequest: 'warn' })
}

enableMocking().then(() => createRoot(document.getElementById('root')).render(
	<StrictMode>
		<PrimeReactProvider>
			<ResizerProvider>
				<Router>
					<Routes>
						<Route path="/" element={<Layout />}>
							<Route element={<ProtectedRoute />}>
								<Route index element={<Dashboard />} />
								<Route path="/users" element={<UserList />} />
								<Route path="/user/:userId?" element={<User />} />
								<Route path="/clients" element={<ClientList />} />
								<Route path="/client/:clientId?" element={<ClientForm />} />
								<Route path="/payment-requests" element={<PaymentRequests />} />
								<Route path="/admin/payment-requests" element={<PaymentRequestsAdmin />} />
								<Route path="/weeklyhours" element={<WeeklyHoursList />} />
								<Route path="/weeklyhour/:weeklyhoursId?" element={<WeeklyHoursForm />} />
								<Route path="/tracks" element={<TracksList />} />
							</Route>
						</Route>
						<Route path="/chatbot" element={<ChatBotWidget />} />
					</Routes>
				</Router>
			</ResizerProvider>
		</PrimeReactProvider>
	</StrictMode>,
))
