import { setupWorker } from 'msw/browser'
import { handlers } from '../../mocks/handlers.js'

export const worker = setupWorker(...handlers)
